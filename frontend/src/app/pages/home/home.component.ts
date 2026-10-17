import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <!-- Hero Band — House Green -->
    <section class="hero">
      <div class="hero-content">
        <span class="hero-badge">{{ 'HOME.BADGE' | translate }}</span>
        <h1>{{ 'HOME.TITLE_PART1' | translate }} <br/> {{ 'HOME.TITLE_PART2' | translate }} <span class="brand-accent">3D</span></h1>
        <p class="hero-desc">{{ 'HOME.DESC' | translate }}</p>
        <div class="hero-actions">
          <a routerLink="/molecules" class="btn-primary">
            <mat-icon>view_in_ar</mat-icon> {{ 'HOME.EXPLORE_BTN' | translate }}
          </a>
          <a routerLink="/lessons" class="btn-outline-light">
            <mat-icon>school</mat-icon> {{ 'HOME.START_LEARNING_BTN' | translate }}
          </a>
        </div>
      </div>
    </section>

    <!-- Features Section — warm canvas -->
    <div class="features-section">
      <div class="section-header">
        <h2>{{ 'HOME.FEATURES_TITLE' | translate }}</h2>
        <p>{{ 'HOME.FEATURES_DESC' | translate }}</p>
      </div>

      <div class="card-grid">
        <div class="feature-card" routerLink="/molecules" role="link" tabindex="0" (keydown.enter)="nav('/molecules')" (keydown.space)="nav('/molecules')">
          <div class="feature-icon-wrap">
            <mat-icon>view_in_ar</mat-icon>
          </div>
          <h3>{{ 'HOME.VIEWER_TITLE' | translate }}</h3>
          <p>{{ 'HOME.VIEWER_DESC' | translate }}</p>
          <span class="feature-link">{{ 'HOME.EXPLORE_BTN' | translate }} <mat-icon>arrow_forward</mat-icon></span>
        </div>

        <div class="feature-card" routerLink="/lessons" role="link" tabindex="0" (keydown.enter)="nav('/lessons')" (keydown.space)="nav('/lessons')">
          <div class="feature-icon-wrap">
            <mat-icon>school</mat-icon>
          </div>
          <h3>{{ 'HOME.LESSONS_TITLE' | translate }}</h3>
          <p>{{ 'HOME.LESSONS_DESC' | translate }}</p>
          <span class="feature-link">{{ 'HOME.LESSONS_LINK' | translate }} <mat-icon>arrow_forward</mat-icon></span>
        </div>

        <div class="feature-card" routerLink="/chat" role="link" tabindex="0" (keydown.enter)="nav('/chat')" (keydown.space)="nav('/chat')">
          <div class="feature-icon-wrap">
            <mat-icon>chat</mat-icon>
          </div>
          <h3>{{ 'HOME.TUTOR_TITLE' | translate }}</h3>
          <p>{{ 'HOME.TUTOR_DESC' | translate }}</p>
          <span class="feature-link">{{ 'HOME.TUTOR_LINK' | translate }} <mat-icon>arrow_forward</mat-icon></span>
        </div>

        <div class="feature-card" routerLink="/quiz" role="link" tabindex="0" (keydown.enter)="nav('/quiz')" (keydown.space)="nav('/quiz')">
          <div class="feature-icon-wrap">
            <mat-icon>quiz</mat-icon>
          </div>
          <h3>{{ 'HOME.QUIZ_TITLE' | translate }}</h3>
          <p>{{ 'HOME.QUIZ_DESC' | translate }}</p>
          <span class="feature-link">{{ 'HOME.QUIZ_LINK' | translate }} <mat-icon>arrow_forward</mat-icon></span>
        </div>
      </div>
    </div>

    <!-- Feature Band — dark green call-to-action -->
    <section class="feature-band">
      <div class="band-inner">
        <div class="band-text">
          <h2>{{ 'HOME.BAND_TITLE' | translate }}</h2>
          <p>{{ 'HOME.BAND_DESC' | translate }}</p>
          <div class="band-actions">
            <a routerLink="/login" class="btn-band-primary">{{ 'HOME.BAND_SIGN_IN' | translate }}</a>
            <a routerLink="/lessons" class="btn-band-outline">{{ 'HOME.BAND_BROWSE_LESSONS' | translate }}</a>
          </div>
        </div>
        <div class="band-visual">
          <mat-icon class="band-icon">biotech</mat-icon>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* === Hero Band === */
    .hero {
      background: #1E3932;
      padding: 80px 24px 72px;
      text-align: center;
    }

    .hero-content {
      max-width: 860px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-block;
      padding: 5px 16px;
      border-radius: 50px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.22);
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      margin-bottom: 24px;
      letter-spacing: -0.01em;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
      margin: 0 0 20px;
      letter-spacing: -0.02em;
    }

    .brand-accent {
      color: #d4e9e2;
    }

    .hero-desc {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.70);
      line-height: 1.7;
      margin: 0 0 36px;
      letter-spacing: -0.01em;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: #00754A;
      color: white;
      font-size: 15px;
      font-weight: 600;
      border-radius: 50px;
      text-decoration: none;
      transition: all 0.2s ease;
      letter-spacing: -0.01em;
      border: 1px solid #00754A;
    }

    .btn-primary:hover {
      background: #006241;
      border-color: #006241;
      color: white;
    }

    .btn-primary:active { transform: scale(0.95); }

    .btn-outline-light {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: transparent;
      color: white;
      font-size: 15px;
      font-weight: 600;
      border-radius: 50px;
      border: 1px solid rgba(255,255,255,0.65);
      text-decoration: none;
      transition: all 0.2s ease;
      letter-spacing: -0.01em;
    }

    .btn-outline-light:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .btn-outline-light:active { transform: scale(0.95); }

    .btn-primary mat-icon,
    .btn-outline-light mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* === Features Section === */
    .features-section {
      background: #f2f0eb;
      padding: 64px var(--page-gutter);
      width: 100%;
      max-width: var(--page-max);
      margin: 0 auto;
    }

    .section-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #006241;
      margin: 0 0 8px;
      letter-spacing: -0.01em;
    }

    .section-header p {
      color: rgba(0,0,0,0.58);
      font-size: 1rem;
      margin: 0;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    /* === Feature Cards === */
    .feature-card {
      background: white;
      border-radius: 12px;
      padding: 28px 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24);
    }

    .feature-card:focus-visible {
      outline: 2px solid #00754A;
      outline-offset: 3px;
    }

    .feature-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }

    .feature-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #d4e9e2;
      color: #006241;
      margin-bottom: 18px;
    }

    .feature-icon-wrap mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .feature-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: rgba(0,0,0,0.87);
      margin: 0 0 8px;
      letter-spacing: -0.01em;
    }

    .feature-card p {
      font-size: 0.9rem;
      color: rgba(0,0,0,0.58);
      line-height: 1.6;
      margin: 0 0 18px;
    }

    .feature-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: #00754A;
      letter-spacing: -0.01em;
    }

    .feature-link mat-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
      transition: transform 0.2s ease;
    }

    .feature-card:hover .feature-link mat-icon {
      transform: translateX(3px);
    }

    /* === Feature Band === */
    .feature-band {
      background: #1E3932;
      padding: 0 var(--page-gutter);
    }

    .band-inner {
      max-width: var(--page-max);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 64px 0;
      gap: 40px;
    }

    .band-text {
      flex: 1;
      max-width: 560px;
    }

    .band-text h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      margin: 0 0 12px;
      letter-spacing: -0.02em;
    }

    .band-text p {
      font-size: 1rem;
      color: rgba(255,255,255,0.70);
      line-height: 1.65;
      margin: 0 0 28px;
    }

    .band-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-band-primary {
      display: inline-flex;
      align-items: center;
      padding: 10px 24px;
      background: white;
      color: #00754A;
      font-size: 14px;
      font-weight: 600;
      border-radius: 50px;
      text-decoration: none;
      border: 1px solid white;
      transition: all 0.2s ease;
      letter-spacing: -0.01em;
    }

    .btn-band-primary:hover {
      background: #f2f0eb;
      color: #006241;
    }

    .btn-band-primary:active { transform: scale(0.95); }

    .btn-band-outline {
      display: inline-flex;
      align-items: center;
      padding: 10px 24px;
      background: transparent;
      color: white;
      font-size: 14px;
      font-weight: 600;
      border-radius: 50px;
      border: 1px solid rgba(255,255,255,0.55);
      text-decoration: none;
      transition: all 0.2s ease;
      letter-spacing: -0.01em;
    }

    .btn-band-outline:hover {
      background: rgba(255,255,255,0.08);
      color: white;
    }

    .btn-band-outline:active { transform: scale(0.95); }

    .band-visual {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      flex-shrink: 0;
    }

    .band-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: rgba(255,255,255,0.50);
    }

    @media (max-width: 768px) {
      .band-inner { flex-direction: column; padding: 48px 0; }
      .band-visual { display: none; }
    }

    @media (max-width: 600px) {
      .hero h1 { font-size: 2.2rem; }
      .hero { padding: 56px 20px 48px; }
      .features-section { padding: 48px 16px; }
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) {}

  nav(path: string): void {
    this.router.navigate([path]);
  }
}
