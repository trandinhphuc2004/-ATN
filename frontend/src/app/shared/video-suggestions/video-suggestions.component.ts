import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService, VideoSuggestion } from '../../services/video.service';

/**
 * Khu vuc video bai giang goi y, dung chung cho trang bai hoc va trang phan ung.
 *
 * Cach dung:
 *   <app-video-suggestions [lessonId]="lesson.id"></app-video-suggestions>
 *   <app-video-suggestions [reactionId]="reaction.id"></app-video-suggestions>
 *   <app-video-suggestions [keyword]="'phan ung trung hoa'"></app-video-suggestions>
 *
 * Neu backend chua cau hinh YouTube API key, component tu an hoan toan.
 */
@Component({
  selector: 'app-video-suggestions',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    @if (visible) {
      <div class="video-section">
        <h2>
          <mat-icon>play_circle</mat-icon>
          {{ 'VIDEO.TITLE' | translate }}
        </h2>
        <p class="video-hint">{{ 'VIDEO.HINT' | translate }}</p>

        @if (loading) {
          <div class="video-loading">
            <mat-spinner diameter="32"></mat-spinner>
            <span>{{ 'VIDEO.LOADING' | translate }}</span>
          </div>
        } @else if (videos.length === 0) {
          <div class="video-empty">
            <mat-icon>videocam_off</mat-icon>
            <span>{{ 'VIDEO.EMPTY' | translate }}</span>
          </div>
        } @else {
          <!-- Video dang phat: nhung iframe kich thuoc lon -->
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

          <!-- Danh sach video con lai: bam de doi video dang phat -->
          @if (videos.length > 1) {
            <div class="video-list">
              @for (video of videos; track video.videoId) {
                <button
                  type="button"
                  class="video-item"
                  [class.active]="video.videoId === activeVideo?.videoId"
                  (click)="selectVideo(video)">
                  <div class="thumb">
                    <img [src]="video.thumbnailUrl" [alt]="video.title" loading="lazy" />
                    @if (video.videoId === activeVideo?.videoId) {
                      <span class="playing-badge">
                        <mat-icon>graphic_eq</mat-icon>
                      </span>
                    }
                  </div>
                  <div class="item-info">
                    <span class="item-title">{{ video.title }}</span>
                    <span class="item-channel">{{ video.channelTitle }}</span>
                  </div>
                </button>
              }
            </div>
          }
        }
      </div>
    }
  `,
  styles: [`
    /* border-top thay cho the divider rieng: khi component tu an thi duong ke
       cung an theo, khong de lai gach ngang thua tren trang. */
    .video-section { margin-top: 32px; padding-top: 28px; border-top: 1px solid #edebe9; }
    .video-section h2 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 6px; letter-spacing: -0.01em; }
    .video-section h2 mat-icon { font-size: 20px; width: 20px; height: 20px; color: #00754A; }
    .video-hint { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0 0 18px; }

    .video-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 40px 0; font-size: 14px; color: rgba(0,0,0,0.58); }
    .video-empty { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 32px 0; font-size: 14px; color: rgba(0,0,0,0.40); }
    .video-empty mat-icon { font-size: 22px; width: 22px; height: 22px; }

    /* Ti le 16:9 bang padding-top de iframe tu co gian theo be rong */
    .video-player { position: relative; width: 100%; padding-top: 56.25%; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
    .video-player iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }

    .video-active-info { padding: 14px 4px 0; }
    .video-active-info h4 { font-size: 0.95rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 6px; line-height: 1.4; letter-spacing: -0.01em; }
    .channel { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: rgba(0,0,0,0.58); }
    .channel mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .video-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-top: 20px; }
    .video-item { display: flex; gap: 12px; align-items: flex-start; padding: 8px; background: white; border: 1px solid #edebe9; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s; font-family: inherit; }
    .video-item:hover { border-color: #a8d8c5; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transform: translateY(-1px); }
    .video-item.active { border-color: #00754A; background: #f0f8f5; }
    .video-item:active { transform: scale(0.98); }

    .thumb { position: relative; flex-shrink: 0; width: 88px; height: 60px; border-radius: 6px; overflow: hidden; background: #edebe9; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .playing-badge { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,98,65,0.72); color: white; }
    .playing-badge mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .item-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    /* line-clamp: cat tieu de o 2 dong, tranh the bi keo cao khong deu */
    .item-title { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.87); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .item-channel { font-size: 12px; color: rgba(0,0,0,0.40); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    @media (max-width: 640px) {
      .video-list { grid-template-columns: 1fr; }
    }
  `]
})
export class VideoSuggestionsComponent implements OnChanges {
  /** Lay video theo bai hoc. */
  @Input() lessonId?: number;

  /** Lay video theo phan ung. */
  @Input() reactionId?: number;

  /** Lay video theo tu khoa tu do, dung cho noi dung AI vua tao chua luu vao co so du lieu. */
  @Input() keyword?: string;

  visible = false;
  loading = false;
  videos: VideoSuggestion[] = [];
  activeVideo: VideoSuggestion | null = null;
  activeEmbedUrl: SafeResourceUrl | null = null;

  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Chi tai lai khi mot trong ba dau vao thuc su doi gia tri.
    const relevant = ['lessonId', 'reactionId', 'keyword'].some(k => changes[k]);
    if (relevant) {
      this.load();
    }
  }

  private load(): void {
    // Kiem tra tinh nang truoc: chua co API key thi khong hien gi ca.
    this.videoService.isEnabled().subscribe(enabled => {
      if (!enabled) {
        this.visible = false;
        return;
      }

      const request$ = this.buildRequest();
      if (!request$) {
        this.visible = false;
        return;
      }

      this.visible = true;
      this.loading = true;
      request$.subscribe(videos => {
        this.videos = videos;
        this.loading = false;
        if (videos.length > 0) {
          this.selectVideo(videos[0]);
        } else {
          this.activeVideo = null;
          this.activeEmbedUrl = null;
        }
      });
    });
  }

  private buildRequest() {
    if (this.lessonId) {
      return this.videoService.getForLesson(this.lessonId);
    }
    if (this.reactionId) {
      return this.videoService.getForReaction(this.reactionId);
    }
    if (this.keyword && this.keyword.trim()) {
      return this.videoService.search(this.keyword.trim());
    }
    return null;
  }

  selectVideo(video: VideoSuggestion): void {
    this.activeVideo = video;
    // youtube-nocookie.com: khong dat cookie theo doi cho den khi nguoi dung bam phat.
    // rel=0 gioi han video de xuat trong cung kenh, tranh de xuat noi dung khong lien quan.
    const url = `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`;
    this.activeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
