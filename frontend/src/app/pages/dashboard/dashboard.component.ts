import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressService } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';
import { Dashboard } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>insights</mat-icon>
        </div>
        <div>
          <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'DASHBOARD.SUBTITLE' | translate }}</p>
        </div>
      </div>

      @if (dashboard) {
        <!-- Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon lessons"><mat-icon>menu_book</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ dashboard.lessonsCompleted }}/{{ dashboard.totalLessons }}</span>
              <span class="metric-label">{{ 'DASHBOARD.LESSONS_COMPLETED' | translate }}</span>
            </div>
            <div class="metric-bar">
              <div class="bar-fill lessons" [style.width.%]="lessonPercent"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon score"><mat-icon>emoji_events</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ dashboard.averageScore | number:'1.0-0' }}%</span>
              <span class="metric-label">{{ 'DASHBOARD.AVG_SCORE' | translate }}</span>
            </div>
            <div class="metric-bar">
              <div class="bar-fill score" [style.width.%]="dashboard.averageScore"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon quizzes"><mat-icon>quiz</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ dashboard.totalQuizzesTaken }}</span>
              <span class="metric-label">{{ 'DASHBOARD.QUIZZES_TAKEN' | translate }}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon time"><mat-icon>schedule</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ dashboard.totalStudyMinutes }} {{ 'DASHBOARD.MINUTES' | translate }}</span>
              <span class="metric-label">{{ 'DASHBOARD.TOTAL_TIME' | translate }}</span>
            </div>
          </div>
        </div>
        
        <!-- Charts -->
        <div class="charts-grid">
          <!-- Weekly Study Time Chart -->
          <div class="chart-card">
            <h3>{{ 'DASHBOARD.WEEKLY_TIME' | translate }}</h3>
            <div class="bar-chart">
              @for (entry of dashboard.weeklyStudyTime; track entry.day) {
                <div class="bar-column">
                  <div class="bar-value">{{ entry.minutes }}{{ 'DASHBOARD.MINUTES' | translate }}</div>
                  <div class="bar" [style.height.%]="getBarHeight(entry.minutes)">
                    <div class="bar-inner"></div>
                  </div>
                  <div class="bar-label">{{ entry.day }}</div>
                </div>
              }
              @if (!dashboard.weeklyStudyTime?.length) {
                <div class="no-data">{{ 'DASHBOARD.NO_WEEKLY_DATA' | translate }}</div>
              }
            </div>
          </div>

          <!-- Score History Chart -->
          <div class="chart-card">
            <h3>{{ 'DASHBOARD.SCORE_HISTORY' | translate }}</h3>
            <div class="score-chart">
              @for (entry of dashboard.scoreHistory; track entry.date) {
                <div class="score-row">
                  <span class="score-date">{{ entry.date }}</span>
                  <div class="score-bar-track">
                    <div class="score-bar-fill" [style.width.%]="entry.percentage"
                         [class.high]="entry.percentage >= 80" [class.mid]="entry.percentage >= 50 && entry.percentage < 80"
                         [class.low]="entry.percentage < 50"></div>
                  </div>
                  <span class="score-val">{{ entry.percentage }}%</span>
                </div>
              }
              @if (!dashboard.scoreHistory?.length) {
                <div class="no-data">{{ 'DASHBOARD.NO_SCORE_DATA' | translate }}</div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="loading-state">
          <mat-spinner></mat-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .metric-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .metric-icon { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; margin-bottom: 14px; }
    .metric-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .metric-icon.lessons { background: #d4e9e2; color: #006241; }
    .metric-icon.score { background: #faf6ee; color: #a07c3e; }
    .metric-icon.quizzes { background: #d4e9e2; color: #006241; }
    .metric-icon.time { background: #d4e9e2; color: #006241; }
    .metric-info { display: flex; flex-direction: column; gap: 2px; }
    .metric-value { font-size: 1.4rem; font-weight: 700; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .metric-label { font-size: 12px; color: rgba(0,0,0,0.58); font-weight: 500; }
    .metric-bar { height: 5px; background: #edebe9; border-radius: 50px; margin-top: 14px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 50px; transition: width 0.8s ease; }
    .bar-fill.lessons { background: #00754A; }
    .bar-fill.score { background: #cba258; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .chart-card h3 { font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 20px; letter-spacing: -0.01em; }
    .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding-top: 20px; }
    .bar-column { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .bar-value { font-size: 11px; font-weight: 600; color: rgba(0,0,0,0.50); margin-bottom: 4px; }
    .bar { width: 100%; max-width: 28px; border-radius: 4px 4px 0 0; overflow: hidden; min-height: 4px; transition: height 0.6s ease; }
    .bar-inner { width: 100%; height: 100%; background: #00754A; border-radius: 4px 4px 0 0; }
    .bar-label { font-size: 11px; color: rgba(0,0,0,0.40); font-weight: 500; margin-top: 8px; }
    .score-chart { display: flex; flex-direction: column; gap: 10px; }
    .score-row { display: flex; align-items: center; gap: 12px; }
    .score-date { font-size: 12px; color: rgba(0,0,0,0.50); width: 60px; flex-shrink: 0; text-align: right; }
    .score-bar-track { flex: 1; height: 8px; background: #edebe9; border-radius: 50px; overflow: hidden; }
    .score-bar-fill { height: 100%; border-radius: 50px; transition: width 0.6s ease; }
    .score-bar-fill.high { background: #00754A; }
    .score-bar-fill.mid { background: #cba258; }
    .score-bar-fill.low { background: #c82014; }
    .score-val { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); width: 40px; }
    .no-data { display: flex; align-items: center; justify-content: center; width: 100%; height: 160px; font-size: 14px; color: rgba(0,0,0,0.40); text-align: center; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }
    @media (max-width: 768px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } .charts-grid { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { .metrics-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  lessonPercent = 0;
  private maxStudyMinutes = 60;

  constructor(
    private progressService: ProgressService,
    public authService: AuthService
  ) {}
  ngOnInit(): void {
    this.progressService.getDashboard().subscribe(data => {
      this.dashboard = data;
      this.lessonPercent = data.totalLessons > 0
        ? (data.lessonsCompleted / data.totalLessons) * 100 : 0;
      if (data.weeklyStudyTime?.length) {
        this.maxStudyMinutes = Math.max(...data.weeklyStudyTime.map(w => w.minutes), 1);
      }
    });
  }

  getBarHeight(minutes: number): number {
    return Math.max((minutes / this.maxStudyMinutes) * 100, 3);
  }
}
