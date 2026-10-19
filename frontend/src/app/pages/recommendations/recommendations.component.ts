import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RecommendationService } from '../../services/recommendation.service';
import { Recommendation, WeakTopic, Suggestion } from '../../models/models';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>psychology</mat-icon>
        </div>
        <div>
          <h1>{{ 'RECOMMEND.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'RECOMMEND.SUBTITLE' | translate }}</p>
        </div>
      </div>

      @if (recommendation) {
        <!-- Weak Topics -->
        @if (recommendation.weakTopics?.length) {
          <div class="section">
            <h2>
              <mat-icon>trending_down</mat-icon>
              {{ 'RECOMMEND.WEAK_TOPICS' | translate }}
            </h2>
            <div class="weak-topics-grid">
              @for (topic of recommendation.weakTopics; track topic.topic) {
                <div class="weak-card">
                  <div class="weak-header">
                    <span class="weak-name">{{ topic.topic }}</span>
                    <span class="weak-score" [class.critical]="topic.averageScore < 40"
                          [class.warning]="topic.averageScore >= 40 && topic.averageScore < 70">
                      {{ topic.averageScore | number:'1.0-0' }}%
                    </span>
                  </div>
                  <div class="weak-bar-track">
                    <div class="weak-bar-fill" [style.width.%]="topic.averageScore"
                         [class.critical]="topic.averageScore < 40"
                         [class.warning]="topic.averageScore >= 40"></div>
                  </div>
                  <div class="weak-meta">
                    <span>{{ topic.quizzesTaken }} {{ 'RECOMMEND.ATTEMPTS' | translate }}</span>
                    <span>{{ 'RECOMMEND.TARGET' | translate }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="success-banner">
            <mat-icon>celebration</mat-icon>
            <div>
              <h3>{{ 'RECOMMEND.GREAT_JOB' | translate }}</h3>
              <p>{{ 'RECOMMEND.NO_WEAK_TOPICS' | translate }}</p>
            </div>
          </div>
        }

        <!-- Suggestions -->
        @if (recommendation.suggestions?.length) {
          <div class="section">
            <h2>
              <mat-icon>lightbulb</mat-icon>
              {{ 'RECOMMEND.SUGGESTIONS' | translate }}
            </h2>
            <div class="suggestions-list">
              @for (suggestion of recommendation.suggestions; track suggestion.title) {
                <div class="suggestion-card">
                  <div class="sug-icon" [ngClass]="suggestion.type">
                    @if (suggestion.type === 'LESSON') {
                      <mat-icon>menu_book</mat-icon>
                    } @else if (suggestion.type === 'QUIZ') {
                      <mat-icon>quiz</mat-icon>
                    } @else {
                      <mat-icon>science</mat-icon>
                    }
                  </div>
                  <div class="sug-info">
                    <h4>{{ suggestionText(suggestion.titleKey, suggestion.title, suggestion.params) }}</h4>
                    <p>{{ suggestionText(suggestion.descriptionKey, suggestion.description, suggestion.params) }}</p>
                  </div>
                  <a class="sug-action"
                     [routerLink]="suggestion.type === 'LESSON' ? '/lessons/' + suggestion.referenceId : '/quiz'">
                    {{ (suggestion.type === 'LESSON' ? 'RECOMMEND.START_LESSON' : 'RECOMMEND.TAKE_QUIZ') | translate }}
                    <mat-icon>arrow_forward</mat-icon>
                  </a>
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <div class="loading-state">
          <mat-spinner></mat-spinner>
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
    .section { margin-bottom: 36px; }
    .section h2 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 18px; letter-spacing: -0.01em; }
    .section h2 mat-icon { font-size: 20px; width: 20px; height: 20px; color: #00754A; }
    .weak-topics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .weak-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .weak-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .weak-name { font-size: 0.95rem; font-weight: 600; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .weak-score { font-size: 1.1rem; font-weight: 700; color: rgba(0,0,0,0.87); }
    .weak-score.critical { color: #c82014; }
    .weak-score.warning { color: #cba258; }
    .weak-bar-track { height: 8px; background: #edebe9; border-radius: 50px; overflow: hidden; margin-bottom: 10px; }
    .weak-bar-fill { height: 100%; border-radius: 50px; background: #00754A; transition: width 0.6s ease; }
    .weak-bar-fill.critical { background: #c82014; }
    .weak-bar-fill.warning { background: #cba258; }
    .weak-meta { display: flex; justify-content: space-between; font-size: 12px; color: rgba(0,0,0,0.40); }
    .success-banner { display: flex; align-items: center; gap: 16px; padding: 24px; background: #d4e9e2; border-radius: 12px; margin-bottom: 32px; }
    .success-banner mat-icon { font-size: 36px; width: 36px; height: 36px; color: #006241; }
    .success-banner h3 { font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .success-banner p { font-size: 14px; color: rgba(0,0,0,0.58); margin: 0; }
    .suggestions-list { display: flex; flex-direction: column; gap: 12px; }
    .suggestion-card { display: flex; align-items: center; gap: 16px; background: white; border-radius: 12px; padding: 18px 20px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); transition: all 0.2s; }
    .suggestion-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06); }
    .sug-icon { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: #d4e9e2; color: #006241; }
    .sug-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .sug-icon.LESSON { background: #d4e9e2; color: #006241; }
    .sug-icon.QUIZ { background: #faf6ee; color: #a07c3e; }
    .sug-icon.PRACTICE { background: #d4e9e2; color: #006241; }
    .sug-info { flex: 1; }
    .sug-info h4 { font-size: 0.95rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 4px; letter-spacing: -0.01em; }
    .sug-info p { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; line-height: 1.5; }
    .sug-action { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 50px; background: #d4e9e2; color: #006241; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; transition: all 0.2s; letter-spacing: -0.01em; border: 1px solid #a8d8c5; }
    .sug-action:hover { background: #00754A; color: white; border-color: #00754A; }
    .sug-action:active { transform: scale(0.95); }
    .sug-action mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }
    @media (max-width: 640px) { .suggestion-card { flex-direction: column; align-items: flex-start; } .sug-action { width: 100%; justify-content: center; } }
  `]
})
export class RecommendationsComponent implements OnInit {
  recommendation: Recommendation | null = null;

  constructor(
    private recommendationService: RecommendationService,
    private translate: TranslateService
  ) {}

  /**
   * Dich goi y theo khoa i18n tu backend; neu khong co khoa (hoac thieu ban dich)
   * thi dung nguyen van tieng Anh tu backend lam du phong.
   */
  suggestionText(key: string | undefined, fallback: string, params?: Record<string, any>): string {
    if (!key) return fallback;
    const translated = this.translate.instant(key, params);
    return translated === key ? fallback : translated;
  }

  ngOnInit(): void {
    this.recommendationService.getRecommendations().subscribe(data => {
      this.recommendation = data;
    });
  }
}
