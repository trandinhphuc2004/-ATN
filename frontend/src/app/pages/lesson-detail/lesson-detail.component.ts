import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LessonService } from '../../services/lesson.service';
import { ProgressService } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';
import { Lesson } from '../../models/models';
import { VideoSuggestionsComponent } from '../../shared/video-suggestions/video-suggestions.component';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule, TranslateModule,
    VideoSuggestionsComponent
  ],
  template: `
    <div class="page-wrapper">
      <a routerLink="/lessons" class="back-link">
        <mat-icon>arrow_back</mat-icon> {{ 'LESSONS.BACK' | translate }}
      </a>

      @if (lesson) {
        <div class="lesson-article">
          <div class="article-header">
            <h1>{{ lesson.title }}</h1>
            <div class="meta-row">
              <span class="meta-badge topic">{{ lesson.topic }}</span>
              <span class="meta-badge" [class]="'diff-' + lesson.difficulty.toLowerCase()">
                {{ lesson.difficulty }}
              </span>
            </div>
          </div>

          <div class="article-divider"></div>

          <div class="content-html" [innerHTML]="safeContent"></div>

          @if (lesson.molecule) {
            <div class="article-divider"></div>
            <div class="molecule-cta">
              <div class="cta-icon">
                <mat-icon>view_in_ar</mat-icon>
              </div>
              <div class="cta-text">
                <strong>{{ 'LESSONS.CTA_TITLE' | translate }}</strong>
                <span>{{ lesson.molecule.name }} ({{ lesson.molecule.formula }})</span>
              </div>
              <a [routerLink]="['/molecules', lesson.molecule.id]" class="cta-btn">
                {{ 'LESSONS.VIEW_3D' | translate }} <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
          }

          <!-- Video bai giang goi y tu YouTube. Tu an neu backend chua co API key,
               nen khong dat article-divider o day de tranh gach ngang thua. -->
          <app-video-suggestions [lessonId]="lesson.id"></app-video-suggestions>
        </div>
      } @else if (loadError) {
        <!-- Bai hoc khong ton tai hoac chua duoc giao cho lop cua hoc sinh (403) -->
        <div class="load-error"><mat-icon>block</mat-icon> {{ loadError | translate }}</div>
      } @else {
        <div class="loading-state">
          <mat-spinner></mat-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-text); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: rgba(0,0,0,0.58); font-size: 14px; font-weight: 500; text-decoration: none; margin-bottom: 24px; transition: color 0.2s; }
    .back-link:hover { color: #00754A; }
    .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .lesson-article { background: white; border-radius: 12px; padding: 36px 32px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .article-header h1 { font-size: 1.5rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 14px; line-height: 1.35; letter-spacing: -0.01em; }
    .meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .meta-badge { font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 50px; }
    .meta-badge.topic { background: #d4e9e2; color: #006241; }
    .diff-easy { background: #d4e9e2; color: #006241; }
    .diff-medium { background: #faf6ee; color: #a07c3e; }
    .diff-hard { background: rgba(200,32,20,0.08); color: #c82014; }
    .article-divider { height: 1px; background: #edebe9; margin: 24px 0; }
    .content-html { line-height: 1.85; font-size: 15px; color: rgba(0,0,0,0.87); }
    .content-html h2 { color: #006241; font-weight: 700; margin-top: 28px; letter-spacing: -0.01em; }
    .content-html h3 { color: rgba(0,0,0,0.87); font-weight: 700; margin-top: 20px; letter-spacing: -0.01em; }
    .content-html ul { padding-left: 20px; }
    .content-html li { margin-bottom: 8px; }
    /* sub/sup: bai hoc do AI soan dung de viet dung dang H2O va Ca2+ */
    .content-html sub, .content-html sup { font-size: 0.75em; line-height: 0; }
    /* bang so sanh do AI sinh ra: cho cuon ngang de khong tran trang */
    .content-html table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; display: block; overflow-x: auto; }
    .content-html th, .content-html td { border: 1px solid #edebe9; padding: 9px 12px; text-align: left; }
    .content-html th { background: #f7f6f5; font-weight: 700; }
    .molecule-cta { display: flex; align-items: center; gap: 16px; padding: 18px 20px; background: #d4e9e2; border-radius: 12px; }
    .cta-icon { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .cta-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .cta-text { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .cta-text strong { font-size: 14px; color: rgba(0,0,0,0.87); font-weight: 700; letter-spacing: -0.01em; }
    .cta-text span { font-size: 13px; color: rgba(0,0,0,0.58); }
    .cta-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; font-size: 14px; font-weight: 600; color: white; background: #00754A; border-radius: 50px; text-decoration: none; transition: all 0.2s; white-space: nowrap; letter-spacing: -0.01em; border: 1px solid #00754A; }
    .cta-btn:hover { background: #006241; border-color: #006241; }
    .cta-btn:active { transform: scale(0.95); }
    .cta-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }
    .load-error { display: flex; align-items: center; gap: 8px; margin-top: 24px; padding: 14px 16px; border-radius: 9px; background: rgba(200,32,20,0.06); color: #c82014; font-size: 14px; }
    @media (max-width: 640px) { .lesson-article { padding: 24px 18px; } .molecule-cta { flex-direction: column; text-align: center; } }
  `]
})
export class LessonDetailComponent implements OnInit, OnDestroy {
  lesson: Lesson | null = null;
  loadError = '';
  safeContent: SafeHtml = '';
  private startTime: Date = new Date();
  private completionSent = false;

  constructor(
    private route: ActivatedRoute,
    private lessonService: LessonService,
    private sanitizer: DomSanitizer,
    private progressService: ProgressService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.startTime = new Date();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.lessonService.getById(id).subscribe({
      next: lesson => {
        this.lesson = lesson;
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(lesson.content);
        // Ghi nhan ngay khi bai hoc mo ra. Truoc day phai doi 5 giay, nen ai doc nhanh
        // roi thoat lien thi bai hoc khong bao gio duoc tinh la da hoan thanh tren bang dieu khien.
        this.markCompleted();
      },
      error: err => {
        this.loadError = err?.status === 403 ? 'LESSONS.NOT_IN_CLASS' : 'LESSONS.NOT_FOUND';
      }
    });
  }

  /** Danh dau bai hoc da hoan thanh, chi gui mot lan cho moi lan vao trang. */
  private markCompleted(): void {
    if (this.completionSent || !this.lesson) return;
    if (!this.authService.isLoggedIn()) return;
    this.completionSent = true;
    this.progressService.markLessonCompleted(this.lesson.id).subscribe({
      error: (err) => console.warn('Could not mark lesson as completed:', err)
    });
  }

  ngOnDestroy(): void {
    // Chỉ ghi nhận nếu user đã đăng nhập và bài học đã load xong
    if (!this.authService.isLoggedIn() || !this.lesson) return;

    const endTime = new Date();
    const durationMs = endTime.getTime() - this.startTime.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    // Ghi nhận thời gian học (tối thiểu 1 phút)
    const minutesToRecord = Math.max(durationMinutes, 1);
    this.progressService.recordStudySession('LESSON', this.lesson.id, minutesToRecord).subscribe({
      error: (err) => console.warn('Could not record study session:', err)
    });
  }
}
