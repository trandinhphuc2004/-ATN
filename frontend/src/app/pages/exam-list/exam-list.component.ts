import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Exam } from '../../models/models';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>assignment</mat-icon>
        </div>
        <div>
          <h1>{{ 'EXAM_LIST.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'EXAM_LIST.SUBTITLE' | translate }}</p>
        </div>
      </div>

      @if (isStudent && currentUser?.className) {
        <p class="class-scope"><mat-icon>groups</mat-icon> {{ 'EXAM_LIST.CLASS_SCOPE' | translate:{ name: currentUser?.className } }}</p>
      }

      @if (loading) {
        <div class="loading-state"><mat-spinner></mat-spinner></div>
      } @else if (isStudent && !currentUser?.className) {
        <div class="empty-state">
          <mat-icon>groups</mat-icon>
          <p>{{ 'EXAM_LIST.NO_CLASS' | translate }}</p>
        </div>
      } @else if (!exams.length) {
        <div class="empty-state">
          <mat-icon>assignment_late</mat-icon>
          <h3>{{ 'EXAM_LIST.EMPTY_TITLE' | translate }}</h3>
          <p>{{ 'EXAM_LIST.EMPTY_DESC' | translate }}</p>
        </div>
      } @else {
        <div class="exam-grid">
          @for (exam of exams; track exam.id) {
            <div class="exam-card">
              <div class="card-top">
                <div class="card-icon">
                  <mat-icon>assignment</mat-icon>
                </div>
                <div class="card-badges">
                  @if (exam.topic) {
                    <span class="badge topic">{{ exam.topic }}</span>
                  }
                  @if (exam.difficulty) {
                    <span class="badge diff">{{ 'AI_GENERATOR.DIFFICULTIES.' + exam.difficulty | translate }}</span>
                  }
                </div>
              </div>

              <h3>{{ exam.title }}</h3>
              @if (exam.description) {
                <p class="card-desc">{{ exam.description }}</p>
              }

              <div class="card-meta">
                <span><mat-icon>timer</mat-icon> {{ exam.timeLimitMinutes }} {{ 'EXAM_MANAGE.MINUTES_SHORT' | translate }}</span>
                <span><mat-icon>help_outline</mat-icon> {{ exam.questionCount }} {{ 'EXAM_MANAGE.QUESTIONS_SHORT' | translate }}</span>
                <span><mat-icon>person</mat-icon> {{ exam.createdByName }}</span>
              </div>

              <div class="card-actions">
                <a [routerLink]="['/exams', exam.id, 'take']" class="start-btn">
                  {{ 'EXAM_LIST.START_BTN' | translate }} <mat-icon>arrow_forward</mat-icon>
                </a>
                <a [routerLink]="['/exams', exam.id, 'review']" class="review-btn">
                  <mat-icon>fact_check</mat-icon> {{ 'EXAM_LIST.REVIEW_BTN' | translate }}
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-mid); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; }
    .exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .exam-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); transition: all 0.2s; }
    .exam-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06); }
    .card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .card-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #d4e9e2; color: #006241; }
    .card-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .card-badges { display: flex; gap: 6px; }
    .badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 50px; }
    .badge.topic { background: #d4e9e2; color: #006241; }
    .badge.diff { background: #edebe9; color: rgba(0,0,0,0.58); }
    .exam-card h3 { font-size: 1.05rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 6px; letter-spacing: -0.01em; }
    .card-desc { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0 0 14px; line-height: 1.5; }
    .card-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
    .card-meta span { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(0,0,0,0.40); }
    .card-meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .card-actions { display: flex; flex-direction: column; gap: 8px; }
    .review-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 9px; border: 1px solid #a8d8c5; border-radius: 50px; background: #d4e9e2; color: #006241; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; letter-spacing: -0.01em; box-sizing: border-box; }
    .review-btn:hover { background: #a8d8c5; }
    .review-btn mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .start-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; border-radius: 50px; background: #00754A; color: white; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; letter-spacing: -0.01em; }
    .start-btn:hover { background: #006241; }
    .start-btn:active { transform: scale(0.95); }
    .start-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }
    .class-scope { display: flex; align-items: center; gap: 6px; margin: -16px 0 20px; font-size: 14px; font-weight: 600; color: #006241; }
    .class-scope mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 24px; background: white; border-radius: 12px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); text-align: center; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: rgba(0,0,0,0.20); margin-bottom: 12px; }
    .empty-state h3 { font-size: 1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 6px; letter-spacing: -0.01em; }
    .empty-state p { font-size: 14px; color: rgba(0,0,0,0.40); margin: 0; }
    @media (max-width: 640px) { .exam-grid { grid-template-columns: 1fr; } }
  `],
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  loading = true;

  constructor(private examService: ExamService, private authService: AuthService) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isStudent(): boolean {
    return this.currentUser?.role === 'STUDENT';
  }

  ngOnInit(): void {
    this.examService.getActiveExams().subscribe({
      next: (exams) => { this.exams = exams; this.loading = false; },
      error: () => this.loading = false,
    });
  }
}
