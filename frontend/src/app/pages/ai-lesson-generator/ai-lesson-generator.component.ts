import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { LessonService, AiLessonRequest, AiLessonResponse } from '../../services/lesson.service';
import { VideoSuggestion } from '../../services/video.service';

/**
 * Tao bai hoc bang AI: nguoi dung nhap tieu de, AI sinh noi dung day du kem video.
 *
 * Luong lam viec: nhap tieu de -> AI sinh -> XEM TRUOC -> bam luu (hoac sinh lai).
 * Bai hoc chi vao co so du lieu khi nguoi dung bam luu, tranh luu bai kem chat luong.
 */
@Component({
  selector: 'app-ai-lesson-generator',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatProgressSpinnerModule, TranslateModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>auto_stories</mat-icon>
        </div>
        <div>
          <h1>{{ 'AI_LESSON.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'AI_LESSON.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <!-- Form nhap tieu de -->
      <div class="input-card">
        <div class="form-group">
          <label>{{ 'AI_LESSON.LESSON_TITLE' | translate }}</label>
          <input
            type="text"
            [(ngModel)]="request.title"
            (keyup.enter)="generate()"
            [disabled]="loading"
            [placeholder]="'AI_LESSON.TITLE_PLACEHOLDER' | translate" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>{{ 'AI_LESSON.DIFFICULTY' | translate }}</label>
            <select [(ngModel)]="request.difficulty" [disabled]="loading">
              <option value="EASY">{{ 'AI_LESSON.DIFF_EASY' | translate }}</option>
              <option value="MEDIUM">{{ 'AI_LESSON.DIFF_MEDIUM' | translate }}</option>
              <option value="HARD">{{ 'AI_LESSON.DIFF_HARD' | translate }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ 'AI_LESSON.TOPIC_OPTIONAL' | translate }}</label>
            <input
              type="text"
              [(ngModel)]="request.topic"
              [disabled]="loading"
              [placeholder]="'AI_LESSON.TOPIC_PLACEHOLDER' | translate" />
          </div>
        </div>

        <button class="generate-btn" (click)="generate()" [disabled]="loading || !request.title.trim()">
          @if (loading) {
            <mat-spinner diameter="20"></mat-spinner>
            <span>{{ loadingStatus }}</span>
          } @else {
            <mat-icon>auto_awesome</mat-icon>
            <span>{{ 'AI_LESSON.GENERATE' | translate }}</span>
          }
        </button>

        <!-- Goi y tieu de mau -->
        @if (!lesson && !loading) {
          <div class="samples">
            <span class="samples-label">{{ 'AI_LESSON.SAMPLES' | translate }}</span>
            <div class="chips">
              @for (sample of samples; track sample) {
                <button class="chip" (click)="useSample(sample)">{{ sample }}</button>
              }
            </div>
          </div>
        }
      </div>

      @if (errorMessage) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      }

      <!-- Xem truoc bai hoc -->
      @if (lesson && !loading) {
        <div class="preview-header">
          <div class="preview-label">
            <mat-icon>visibility</mat-icon>
            <span>{{ 'AI_LESSON.PREVIEW' | translate }}</span>
          </div>
          <div class="preview-actions">
            <button class="btn-outline" (click)="generate()" [disabled]="saving">
              <mat-icon>refresh</mat-icon>
              {{ 'AI_LESSON.REGENERATE' | translate }}
            </button>
            <button class="btn-primary" (click)="save()" [disabled]="saving">
              @if (saving) {
                <mat-spinner diameter="18"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              {{ 'AI_LESSON.SAVE' | translate }}
            </button>
          </div>
        </div>

        <div class="lesson-article">
          <div class="article-header">
            <h2>{{ lesson.title }}</h2>
            <div class="meta-row">
              <span class="meta-badge topic">{{ lesson.topic }}</span>
              <span class="meta-badge" [class]="'diff-' + lesson.difficulty.toLowerCase()">
                {{ difficultyLabel(lesson.difficulty) }}
              </span>
              <span class="meta-badge length">
                {{ lesson.content.length }} {{ 'AI_LESSON.CHARS' | translate }}
              </span>
            </div>
          </div>

          <div class="article-divider"></div>

          <div class="content-html" [innerHTML]="safeContent"></div>

          <!-- Video dinh kem, tim theo tieu de bai hoc -->
          @if (lesson.videos?.length) {
            <div class="video-block">
              <h3>
                <mat-icon>play_circle</mat-icon>
                {{ 'AI_LESSON.ATTACHED_VIDEOS' | translate }}
              </h3>
              <p class="video-note">{{ 'AI_LESSON.VIDEO_NOTE' | translate }}</p>

              @if (activeVideo) {
                <div class="video-player">
                  <iframe
                    [src]="activeEmbedUrl"
                    title="{{ activeVideo.title }}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                  </iframe>
                </div>
                <div class="video-active-info">
                  <h4>{{ activeVideo.title }}</h4>
                  <span class="channel">
                    <mat-icon>account_circle</mat-icon>
                    {{ activeVideo.channelTitle }}
                  </span>
                </div>
              }

              @if (lesson.videos.length > 1) {
                <div class="video-list">
                  @for (video of lesson.videos; track video.videoId) {
                    <button
                      type="button"
                      class="video-item"
                      [class.active]="video.videoId === activeVideo?.videoId"
                      (click)="selectVideo(video)">
                      <div class="thumb">
                        <img [src]="video.thumbnailUrl" [alt]="video.title" loading="lazy" />
                      </div>
                      <div class="item-info">
                        <span class="item-title">{{ video.title }}</span>
                        <span class="item-channel">{{ video.channelTitle }}</span>
                      </div>
                    </button>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="no-video">
              <mat-icon>videocam_off</mat-icon>
              <span>{{ 'AI_LESSON.NO_VIDEO' | translate }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-mid); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; }

    /* Form nhap */
    .input-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .form-row { display: grid; grid-template-columns: 180px 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.87); margin-bottom: 6px; letter-spacing: -0.01em; }
    .form-group input, .form-group select { width: 100%; padding: 11px 14px; font-size: 14px; font-family: inherit; color: rgba(0,0,0,0.87); border: 1px solid #d8d6d3; border-radius: 8px; background: white; transition: border-color 0.2s; box-sizing: border-box; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #00754A; }
    .form-group input:disabled, .form-group select:disabled { background: #f7f6f5; color: rgba(0,0,0,0.40); }

    .generate-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 24px; font-size: 14px; font-weight: 600; font-family: inherit; color: white; background: #00754A; border: 1px solid #00754A; border-radius: 50px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .generate-btn:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .generate-btn:active:not(:disabled) { transform: scale(0.98); }
    .generate-btn:disabled { background: #d8d6d3; border-color: #d8d6d3; cursor: not-allowed; }
    .generate-btn ::ng-deep circle { stroke: white; }

    /* Goi y tieu de */
    .samples { margin-top: 20px; padding-top: 18px; border-top: 1px solid #edebe9; }
    .samples-label { display: block; font-size: 12px; color: rgba(0,0,0,0.40); margin-bottom: 10px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 6px 14px; font-size: 12.5px; font-family: inherit; color: #006241; background: #d4e9e2; border: 1px solid transparent; border-radius: 50px; cursor: pointer; transition: all 0.2s; }
    .chip:hover { background: #00754A; color: white; }

    .error-banner { display: flex; align-items: center; gap: 10px; margin-top: 20px; padding: 14px 18px; background: rgba(200,32,20,0.06); border: 1px solid rgba(200,32,20,0.2); border-radius: 10px; font-size: 13.5px; color: #c82014; }
    .error-banner mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }

    /* Thanh hanh dong khi xem truoc */
    .preview-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 32px 0 14px; flex-wrap: wrap; }
    .preview-label { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: #006241; }
    .preview-label mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .preview-actions { display: flex; gap: 10px; }
    .btn-outline, .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; font-size: 13px; font-weight: 600; font-family: inherit; border-radius: 50px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-outline { color: #006241; background: white; border: 1px solid #a8d8c5; }
    .btn-outline:hover:not(:disabled) { background: #d4e9e2; }
    .btn-primary { color: white; background: #00754A; border: 1px solid #00754A; }
    .btn-primary:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .btn-outline:disabled, .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline mat-icon, .btn-primary mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .btn-primary ::ng-deep circle { stroke: white; }

    /* Khoi bai hoc xem truoc: dung lai style cua trang chi tiet bai hoc
       de nguoi dung thay dung cai se hien ra sau khi luu. */
    .lesson-article { background: white; border-radius: 12px; padding: 32px 30px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .article-header h2 { font-size: 1.4rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 14px; line-height: 1.35; letter-spacing: -0.01em; }
    .meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .meta-badge { font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 50px; }
    .meta-badge.topic { background: #d4e9e2; color: #006241; }
    .meta-badge.length { background: #f7f6f5; color: rgba(0,0,0,0.40); }
    .diff-easy { background: #d4e9e2; color: #006241; }
    .diff-medium { background: #faf6ee; color: #a07c3e; }
    .diff-hard { background: rgba(200,32,20,0.08); color: #c82014; }
    .article-divider { height: 1px; background: #edebe9; margin: 22px 0; }

    .content-html { line-height: 1.85; font-size: 15px; color: rgba(0,0,0,0.87); }
    .content-html ::ng-deep h2 { color: #006241; font-weight: 700; margin-top: 28px; font-size: 1.15rem; letter-spacing: -0.01em; }
    .content-html ::ng-deep h3 { color: rgba(0,0,0,0.87); font-weight: 700; margin-top: 20px; font-size: 1rem; letter-spacing: -0.01em; }
    .content-html ::ng-deep ul { padding-left: 20px; }
    .content-html ::ng-deep li { margin-bottom: 8px; }
    /* table cua AI co the rong hon khung -> cho cuon ngang thay vi tran trang */
    .content-html ::ng-deep table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; display: block; overflow-x: auto; }
    .content-html ::ng-deep th, .content-html ::ng-deep td { border: 1px solid #edebe9; padding: 9px 12px; text-align: left; }
    .content-html ::ng-deep th { background: #f7f6f5; font-weight: 700; }
    /* sub/sup: model AI dung de viet dung dang H2O va Ca2+ */
    .content-html ::ng-deep sub, .content-html ::ng-deep sup { font-size: 0.75em; line-height: 0; }

    /* Video dinh kem */
    .video-block { margin-top: 32px; padding-top: 26px; border-top: 1px solid #edebe9; }
    .video-block h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 5px; letter-spacing: -0.01em; }
    .video-block h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: #00754A; }
    .video-note { font-size: 12.5px; color: rgba(0,0,0,0.40); margin: 0 0 16px; }
    .video-player { position: relative; width: 100%; padding-top: 56.25%; background: #000; border-radius: 12px; overflow: hidden; }
    .video-player iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
    .video-active-info { padding: 13px 2px 0; }
    .video-active-info h4 { font-size: 0.93rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 5px; line-height: 1.4; }
    .channel { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: rgba(0,0,0,0.58); }
    .channel mat-icon { font-size: 15px; width: 15px; height: 15px; }

    .video-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; margin-top: 18px; }
    .video-item { display: flex; gap: 11px; align-items: flex-start; padding: 7px; background: white; border: 1px solid #edebe9; border-radius: 10px; cursor: pointer; text-align: left; font-family: inherit; transition: all 0.2s; }
    .video-item:hover { border-color: #a8d8c5; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .video-item.active { border-color: #00754A; background: #f0f8f5; }
    .thumb { flex-shrink: 0; width: 82px; height: 56px; border-radius: 6px; overflow: hidden; background: #edebe9; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .item-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .item-title { font-size: 12.5px; font-weight: 600; color: rgba(0,0,0,0.87); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .item-channel { font-size: 11.5px; color: rgba(0,0,0,0.40); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .no-video { display: flex; align-items: center; gap: 9px; margin-top: 30px; padding-top: 24px; border-top: 1px solid #edebe9; font-size: 13px; color: rgba(0,0,0,0.40); }
    .no-video mat-icon { font-size: 20px; width: 20px; height: 20px; }

    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
      .lesson-article { padding: 24px 18px; }
      .preview-header { flex-direction: column; align-items: stretch; }
      .preview-actions { flex-direction: column; }
      .btn-outline, .btn-primary { justify-content: center; }
      .video-list { grid-template-columns: 1fr; }
    }
  `]
})
export class AiLessonGeneratorComponent {

  request: AiLessonRequest = { title: '', difficulty: 'MEDIUM', topic: '' };

  lesson: AiLessonResponse | null = null;
  safeContent: SafeHtml = '';

  activeVideo: VideoSuggestion | null = null;
  activeEmbedUrl: SafeResourceUrl | null = null;

  loading = false;
  saving = false;
  loadingStatus = '';
  errorMessage = '';

  /** Tieu de mau de nguoi dung bam thu nhanh, khong phai nghi tu dau. */
  samples = [
    'Cấu trúc phân tử nước',
    'Phản ứng oxi hóa khử',
    'Liên kết hiđro',
    'Thuyết VSEPR',
    'Nồng độ mol và pha loãng dung dịch',
    'Đồng phân trong hóa hữu cơ'
  ];

  /** Nhan trang thai hien khi cho AI, doi theo thoi gian de nguoi dung biet he thong dang chay. */
  private statusTimers: number[] = [];

  constructor(
    private lessonService: LessonService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  useSample(sample: string): void {
    this.request.title = sample;
    this.generate();
  }

  generate(): void {
    const title = this.request.title.trim();
    if (!title || this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.lesson = null;
    this.activeVideo = null;
    this.activeEmbedUrl = null;
    this.startStatusMessages();

    this.lessonService.generateWithAi({
      title,
      difficulty: this.request.difficulty,
      topic: this.request.topic?.trim() || undefined
    }).subscribe({
      next: (res) => {
        this.clearStatusMessages();
        this.loading = false;
        this.lesson = res;
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(res.content);
        if (res.videos?.length) {
          this.selectVideo(res.videos[0]);
        }
      },
      error: (err) => {
        this.clearStatusMessages();
        this.loading = false;
        // Backend tra ve {message: "..."} khi that bai; neu khong co thi dung thong bao chung.
        this.errorMessage = err?.error?.message
          || this.translate.instant('AI_LESSON.ERROR_GENERATE');
      }
    });
  }

  save(): void {
    if (!this.lesson || this.saving) {
      return;
    }
    this.saving = true;

    this.lessonService.create({
      title: this.lesson.title,
      content: this.lesson.content,
      topic: this.lesson.topic,
      difficulty: this.lesson.difficulty
    }).subscribe({
      next: (saved) => {
        this.saving = false;
        this.snackBar.open(
          this.translate.instant('AI_LESSON.SAVED'),
          this.translate.instant('AI_LESSON.CLOSE'),
          { duration: 3000 }
        );
        // Chuyen sang trang chi tiet bai hoc vua luu de nguoi dung xem ket qua that.
        this.router.navigate(['/lessons', saved.id]);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open(
          this.translate.instant('AI_LESSON.ERROR_SAVE'),
          this.translate.instant('AI_LESSON.CLOSE'),
          { duration: 4000 }
        );
      }
    });
  }

  selectVideo(video: VideoSuggestion): void {
    this.activeVideo = video;
    const url = `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`;
    this.activeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  difficultyLabel(difficulty: string): string {
    const key = 'AI_LESSON.DIFF_' + (difficulty || 'MEDIUM').toUpperCase();
    return this.translate.instant(key);
  }

  /**
   * Doi nhan trang thai theo thoi gian. AI mat 20-60s nen can cho nguoi dung
   * thay tien trinh, tranh cam giac he thong treo.
   */
  private startStatusMessages(): void {
    this.loadingStatus = this.translate.instant('AI_LESSON.STATUS_1');
    this.statusTimers = [
      window.setTimeout(() => this.loadingStatus = this.translate.instant('AI_LESSON.STATUS_2'), 6000),
      window.setTimeout(() => this.loadingStatus = this.translate.instant('AI_LESSON.STATUS_3'), 16000),
      window.setTimeout(() => this.loadingStatus = this.translate.instant('AI_LESSON.STATUS_4'), 30000)
    ];
  }

  private clearStatusMessages(): void {
    this.statusTimers.forEach(t => window.clearTimeout(t));
    this.statusTimers = [];
  }
}
