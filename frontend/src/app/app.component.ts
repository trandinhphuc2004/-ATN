import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Router, RouterOutlet, RouterLink, RouterLinkActive,
  NavigationStart, NavigationEnd, NavigationCancel, NavigationError
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { ChatComponent } from './pages/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    TranslateModule,
    ChatComponent
  ],
  template: `
    <!-- Thanh tien trinh khi chuyen trang (lazy-load component) -->
    <div class="route-progress" [class.active]="navigating" aria-hidden="true">
      <div class="route-progress-bar"></div>
    </div>

    <header class="navbar">
      <div class="navbar-inner">
        <a routerLink="/home" class="brand">
          <span class="brand-icon">
            <mat-icon>science</mat-icon>
          </span>
          <span class="brand-text">ChemLab 3D</span>
        </a>

        <nav class="nav-links">
          <!-- 1. HỌC TẬP (LEARNING) -->
          <div class="nav-dropdown">
            <button class="nav-item">
              <mat-icon>school</mat-icon>
              <span>{{ 'NAV.LEARNING' | translate }}</span>
              <mat-icon class="dropdown-icon">expand_more</mat-icon>
            </button>
            <div class="dropdown-content">
              <a routerLink="/lessons" routerLinkActive="active" class="dropdown-item">
                <mat-icon>menu_book</mat-icon>
                <span>{{ 'NAV.LESSONS' | translate }}</span>
              </a>
              <a routerLink="/molecules" routerLinkActive="active" class="dropdown-item">
                <mat-icon>view_in_ar</mat-icon>
                <span>{{ 'NAV.MOLECULES' | translate }}</span>
              </a>
              <a routerLink="/reactions" routerLinkActive="active" class="dropdown-item">
                <mat-icon>science</mat-icon>
                <span>{{ 'NAV.REACTIONS' | translate }}</span>
              </a>
            </div>
          </div>

          <!-- 2. KIỂM TRA & ĐÁNH GIÁ (ASSESSMENT) -->
          <div class="nav-dropdown">
            <button class="nav-item">
              <mat-icon>quiz</mat-icon>
              <span>{{ 'NAV.ASSESSMENT' | translate }}</span>
              <mat-icon class="dropdown-icon">expand_more</mat-icon>
            </button>
            <div class="dropdown-content">
              <a routerLink="/quiz" routerLinkActive="active" class="dropdown-item">
                <mat-icon>rule</mat-icon>
                <span>{{ 'NAV.QUIZ' | translate }}</span>
              </a>
              @if (authService.isLoggedIn()) {
                <a routerLink="/exams" routerLinkActive="active" class="dropdown-item">
                  <mat-icon>assignment</mat-icon>
                  <span>{{ 'NAV.EXAMS' | translate }}</span>
                </a>
              }
            </div>
          </div>

          @if (authService.isLoggedIn()) {
            <!-- 3. PHÒNG LAB AI (AI TOOLS) -->
            <div class="nav-dropdown">
              <button class="nav-item ai-nav">
                <mat-icon>auto_awesome</mat-icon>
                <span>{{ 'NAV.AI_TOOLS' | translate }}</span>
                <mat-icon class="dropdown-icon">expand_more</mat-icon>
              </button>
              <div class="dropdown-content">
                <a routerLink="/ai-questions" routerLinkActive="active" class="dropdown-item">
                  <mat-icon>smart_toy</mat-icon>
                  <span>{{ 'NAV.AI_QUESTIONS' | translate }}</span>
                </a>
                <a routerLink="/ai-reaction-lab" routerLinkActive="active" class="dropdown-item">
                  <mat-icon>biotech</mat-icon>
                  <span>{{ 'NAV.AI_REACTION' | translate }}</span>
                </a>
                <a routerLink="/ai-molecule-viewer" routerLinkActive="active" class="dropdown-item">
                  <mat-icon>3d_rotation</mat-icon>
                  <span>{{ 'NAV.AI_MOLECULE' | translate }}</span>
                </a>
              </div>
            </div>

            <!-- 4. KHÔNG GIAN CỦA TÔI (MY SPACE) -->
            <div class="nav-dropdown">
              <button class="nav-item">
                <mat-icon>person</mat-icon>
                <span>{{ 'NAV.MY_SPACE' | translate }}</span>
                <mat-icon class="dropdown-icon">expand_more</mat-icon>
              </button>
              <div class="dropdown-content">
                <a routerLink="/dashboard" routerLinkActive="active" class="dropdown-item">
                  <mat-icon>insights</mat-icon>
                  <span>{{ 'NAV.DASHBOARD' | translate }}</span>
                </a>
                <a routerLink="/recommendations" routerLinkActive="active" class="dropdown-item">
                  <mat-icon>lightbulb</mat-icon>
                  <span>{{ 'NAV.RECOMMEND' | translate }}</span>
                </a>
                <a routerLink="/profile" routerLinkActive="active" class="dropdown-item">
                  <mat-icon>manage_accounts</mat-icon>
                  <span>{{ 'NAV.MY_PROFILE' | translate }}</span>
                </a>
              </div>
            </div>

            <!-- 5. KHÔNG GIAN GIÁO VIÊN (TEACHER HUB) -->
            @if ((authService.currentUser$ | async)?.role === 'TEACHER' || (authService.currentUser$ | async)?.role === 'ADMIN') {
              <div class="nav-dropdown">
                <button class="nav-item teacher-nav">
                  <mat-icon>admin_panel_settings</mat-icon>
                  <span>{{ 'NAV.TEACHER_HUB' | translate }}</span>
                  <mat-icon class="dropdown-icon">expand_more</mat-icon>
                </button>
                <div class="dropdown-content right-align">
                  <!-- Tao bai hoc bang AI: dat trong khoi giao vien vi backend
                       chi cho ADMIN va TEACHER goi POST /api/ai/generate-lesson -->
                  <a routerLink="/ai-lesson" routerLinkActive="active" class="dropdown-item">
                    <mat-icon>auto_stories</mat-icon>
                    <span>{{ 'NAV.AI_LESSON' | translate }}</span>
                  </a>
                  <a routerLink="/exam-manage" routerLinkActive="active" class="dropdown-item">
                    <mat-icon>edit_note</mat-icon>
                    <span>{{ 'NAV.EXAM_MANAGE' | translate }}</span>
                  </a>
                  <a routerLink="/teacher-dashboard" routerLinkActive="active" class="dropdown-item">
                    <mat-icon>analytics</mat-icon>
                    <span>{{ 'NAV.TEACHER_DASHBOARD' | translate }}</span>
                  </a>
                  @if ((authService.currentUser$ | async)?.role === 'ADMIN') {
                    <div class="dropdown-divider"></div>
                    <a routerLink="/admin/users" routerLinkActive="active" class="dropdown-item admin-item">
                      <mat-icon>manage_accounts</mat-icon>
                      <span>{{ 'NAV.MANAGE_USERS' | translate }}</span>
                    </a>
                    <a routerLink="/admin/classes" routerLinkActive="active" class="dropdown-item admin-item">
                      <mat-icon>groups</mat-icon>
                      <span>{{ 'NAV.MANAGE_CLASSES' | translate }}</span>
                    </a>
                  }
                </div>
              </div>
            }
          }
        </nav>

        <span class="spacer"></span>

        <div class="lang-switcher">
          <button mat-icon-button [matMenuTriggerFor]="langMenu" [title]="'NAV.CHANGE_LANGUAGE' | translate">
            <mat-icon>language</mat-icon>
          </button>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="switchLanguage('vi')">Tiếng Việt</button>
            <button mat-menu-item (click)="switchLanguage('en')">English</button>
          </mat-menu>
        </div>

        @if (authService.isLoggedIn()) {
          <div class="gamification-status" [title]="'NAV.XP_LEVEL_TOOLTIP' | translate">
            <div class="xp-bar-container">
              <div class="xp-bar-fill" [style.width.%]="getXpProgress((authService.currentUser$ | async)?.xp || 0, (authService.currentUser$ | async)?.level || 1)"></div>
            </div>
            <div class="level-badge">
              <mat-icon>military_tech</mat-icon>
              <span>Lv.{{ (authService.currentUser$ | async)?.level || 1 }}</span>
            </div>
          </div>

          <button class="user-btn" [matMenuTriggerFor]="userMenu">
            <span class="avatar">{{ (authService.currentUser$ | async)?.name?.charAt(0) }}</span>
            <span class="user-name">{{ (authService.currentUser$ | async)?.name }}</span>
            <mat-icon class="chevron">expand_more</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu" class="user-menu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>manage_accounts</mat-icon> {{ 'NAV.MY_PROFILE' | translate }}
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item class="logout-item" (click)="logout()">
              <mat-icon>logout</mat-icon> {{ 'NAV.LOGOUT' | translate }}
            </button>
          </mat-menu>
        } @else {
          <a routerLink="/login" class="login-btn">
            {{ 'NAV.SIGN_IN' | translate }}
          </a>
        }
      </div>
    </header>

    <main>
      <router-outlet />
    </main>

    <!-- Lop phu khi dang xuat: che trang cu, tranh thay du lieu cu nhay mat truoc khi chuyen trang -->
    <div class="logout-overlay" [class.show]="authService.loggingOut()" role="status" aria-live="polite">
      @if (authService.loggingOut()) {
        <div class="logout-box">
          <span class="logout-spinner"></span>
          <span>{{ 'AUTH.LOGGING_OUT' | translate }}</span>
        </div>
      }
    </div>

    <!-- Floating AI Chatbot -->
    @if (authService.isLoggedIn()) {
      <div class="chatbox-wrapper" [class.chat-open]="showChat">
        <div class="chat-window">
          <div class="chat-header">
            <div class="chat-header-info">
              <mat-icon>smart_toy</mat-icon>
              <span>{{ 'CHAT.AI_TUTOR' | translate }}</span>
            </div>
            <button (click)="toggleChat()" class="close-chat-btn">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="chat-body-wrapper">
            <app-chat></app-chat>
          </div>
        </div>

        <button class="chat-fab" (click)="toggleChat()" [class.fab-active]="showChat">
          <mat-icon>{{ showChat ? 'close' : 'chat' }}</mat-icon>
          @if (!showChat) {
            <span class="fab-label">{{ 'NAV.AI_TUTOR' | translate }}</span>
          }
        </button>
      </div>
    }
  `,
  styles: [`
    /* === Route progress bar === */
    .route-progress {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 10001;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease 0.1s;
    }

    .route-progress.active { opacity: 1; transition-delay: 0s; }

    .route-progress-bar {
      height: 100%;
      width: 40%;
      background: linear-gradient(90deg, transparent, var(--color-accent), var(--color-gold));
      border-radius: 0 3px 3px 0;
      animation: route-progress 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes route-progress {
      from { transform: translateX(-100%); }
      to   { transform: translateX(250%); }
    }

    /* === Logout overlay === */
    .logout-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(242, 240, 235, 0.82);
      backdrop-filter: blur(6px);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.25s ease, visibility 0s linear 0.25s;
    }

    .logout-overlay.show {
      opacity: 1;
      visibility: visible;
      transition: opacity 0.25s ease, visibility 0s;
    }

    .logout-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 22px;
      background: white;
      border-radius: 50px;
      box-shadow: var(--shadow-modal);
      font-size: 14px;
      font-weight: 600;
      color: var(--color-brand);
      animation: logout-pop 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .logout-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid var(--color-green-light);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes logout-pop {
      from { opacity: 0; transform: translateY(6px) scale(0.96); }
      to   { opacity: 1; transform: none; }
    }

    ::ng-deep .logout-item,
    ::ng-deep .logout-item mat-icon { color: var(--color-error) !important; }

    .navbar {
      /* Giu navbar dung yen khi chuyen trang (khong mo dan cung noi dung) */
      view-transition-name: app-navbar;
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(8px);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.07);
    }

    .navbar-inner {
      max-width: var(--page-max);
      margin: 0 auto;
      display: flex;
      align-items: center;
      padding: 0 24px;
      height: 68px;
      gap: 8px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      margin-right: 28px;
      flex-shrink: 0;
    }

    .brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1E3932;
      color: white;
    }

    .brand-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .brand-text {
      font-size: 17px;
      font-weight: 700;
      color: #006241;
      letter-spacing: -0.02em;
    }

    .nav-links {
      display: flex;
      gap: 4px;
    }

    /* Dropdown Logic */
    .nav-dropdown {
      position: relative;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0,0,0,0.70);
      background: transparent;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      font-family: inherit;
      letter-spacing: -0.01em;
    }

    .nav-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .dropdown-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      margin-left: -2px;
      color: rgba(0,0,0,0.40);
      transition: transform 0.2s ease;
    }

    .nav-dropdown:hover .dropdown-icon {
      transform: rotate(180deg);
    }

    .nav-item:hover,
    .nav-dropdown:hover > .nav-item {
      color: #00754A;
      background: #d4e9e2;
    }

    .ai-nav { color: #006241; }
    .nav-dropdown:hover > .ai-nav { background: #d4e9e2; color: #00754A; }

    .teacher-nav { color: #006241; }
    .nav-dropdown:hover > .teacher-nav { background: #d4e9e2; color: #00754A; }

    /* Dropdown Content */
    .dropdown-content {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 220px;
      background: #f9f9f9;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
      padding: 8px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(8px);
      transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
      z-index: 1000;
    }

    .dropdown-content.right-align {
      left: auto;
      right: 0;
    }

    .nav-dropdown:hover .dropdown-content {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: rgba(0,0,0,0.80);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease;
      letter-spacing: -0.01em;
    }

    .dropdown-item mat-icon {
      color: rgba(0,0,0,0.45);
      font-size: 20px;
      width: 20px;
      height: 20px;
      transition: color 0.15s ease;
    }

    .dropdown-item:hover {
      background: #d4e9e2;
      color: #006241;
    }

    .dropdown-item:hover mat-icon {
      color: #00754A;
    }

    .dropdown-item.active {
      background: #d4e9e2;
      color: #006241;
      font-weight: 600;
    }

    .dropdown-item.active mat-icon {
      color: #00754A;
    }

    .dropdown-divider {
      height: 1px;
      background: #d6dbde;
      margin: 6px 8px;
    }

    .admin-item { color: #006241; }
    .admin-item mat-icon { color: #00754A; }
    .admin-item:hover { background: #d4e9e2; color: #006241; }

    .spacer { flex: 1; }

    .login-btn {
      padding: 7px 16px;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0,0,0,0.87);
      border: 1px solid rgba(0,0,0,0.87);
      border-radius: 50px;
      text-decoration: none;
      transition: all 0.2s ease;
      letter-spacing: -0.01em;
    }

    .login-btn:hover {
      background: rgba(0,0,0,0.06);
      color: rgba(0,0,0,0.87);
    }

    .gamification-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 12px;
      gap: 4px;
      cursor: help;
    }

    .level-badge {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 700;
      color: #cba258;
      background: #faf6ee;
      padding: 2px 8px;
      border-radius: 50px;
      border: 1px solid #dfc49d;
    }

    .level-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #cba258;
    }

    .xp-bar-container {
      width: 56px;
      height: 5px;
      background: #d6dbde;
      border-radius: 50px;
      overflow: hidden;
    }

    .xp-bar-fill {
      height: 100%;
      background: #cba258;
      border-radius: 50px;
      transition: width 0.5s ease;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px 4px 4px;
      border: 1px solid #d6dbde;
      border-radius: 50px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .user-btn:hover {
      border-color: #b5b5b5;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #1E3932;
      color: white;
      font-size: 13px;
      font-weight: 700;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: rgba(0,0,0,0.80);
      letter-spacing: -0.01em;
    }

    .chevron {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(0,0,0,0.40);
    }

    main {
      min-height: calc(100vh - 68px);
    }

    @media (max-width: 768px) {
      .nav-item span { display: none; }
      .nav-item { padding: 8px 10px; }
      .user-name { display: none; }
      .brand-text { display: none; }
    }

    /* === Floating Chatbox === */
    .chatbox-wrapper {
      position: fixed;
      right: 28px;
      bottom: 28px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 16px;
      pointer-events: none;
    }

    /* Chi bat click cho nut FAB. Truoc day dung "> *" -> sau khi Angular them
       attribute scope, selector nay manh hon ".chat-window { pointer-events: none }"
       nen khung chat AN (opacity 0, 360x520 goc phai duoi) van nuot click,
       che mat nut "Bat dau giai de" va cac nut khac o goc phai man hinh. */
    .chatbox-wrapper > .chat-fab { pointer-events: auto; }

    .chat-fab {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #00754A;
      color: white;
      border: none;
      box-shadow: 0 0 6px rgba(0,0,0,0.24), 0 8px 12px rgba(0,0,0,0.14);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      position: relative;
    }

    .chat-fab:hover {
      background: #006241;
      box-shadow: 0 0 8px rgba(0,0,0,0.28), 0 10px 16px rgba(0,0,0,0.18);
    }

    .chat-fab:active {
      transform: scale(0.95);
      box-shadow: 0 0 6px rgba(0,0,0,0.24), 0 8px 12px rgba(0,0,0,0);
    }

    .chat-fab mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .fab-label {
      position: absolute;
      right: 68px;
      background: white;
      color: rgba(0,0,0,0.80);
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24);
      opacity: 0;
      transform: translateX(8px);
      transition: all 0.2s ease;
      pointer-events: none;
      letter-spacing: -0.01em;
    }

    .chat-fab:hover .fab-label {
      opacity: 1;
      transform: translateX(0);
    }

    .chat-window {
      width: 360px;
      height: 520px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(24px) scale(0.96);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .chatbox-wrapper.chat-open .chat-window {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .chat-header {
      background: #1E3932;
      color: white;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chat-header-info span {
      font-weight: 700;
      font-size: 15px;
      letter-spacing: -0.01em;
    }

    .close-chat-btn {
      background: rgba(255,255,255,0.12);
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .close-chat-btn:hover { background: rgba(255,255,255,0.22); }

    .chat-body-wrapper {
      flex: 1;
      overflow: hidden;
    }

    ::ng-deep app-chat { display: block; height: 100%; }

    ::ng-deep app-chat .page-wrapper {
      padding: 0 !important;
      max-width: none !important;
      height: 100% !important;
    }

    ::ng-deep app-chat .page-header,
    ::ng-deep app-chat .suggestions { display: none !important; }

    ::ng-deep app-chat .chat-card {
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }

    ::ng-deep app-chat .chat-container {
      flex: 1 !important;
      max-height: none !important;
      overflow-y: auto !important;
    }

    @media (max-width: 480px) {
      .chat-window {
        width: calc(100vw - 40px);
        height: min(600px, calc(100vh - 120px));
      }
    }
  `]
})
export class AppComponent {
  showChat = false;
  /** Bat sau 150ms de chuyen trang nhanh khong bi nhap nhay thanh tien trinh. */
  navigating = false;
  private navTimer?: ReturnType<typeof setTimeout>;

  constructor(
    public authService: AuthService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('vi');
    this.translate.use('vi');
    this.authService.refreshCurrentUser();

    const destroyRef = inject(DestroyRef);

    inject(Router).events.pipe(takeUntilDestroyed(destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) {
        clearTimeout(this.navTimer);
        this.navTimer = setTimeout(() => (this.navigating = true), 150);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        clearTimeout(this.navTimer);
        this.navigating = false;
      }
    });

    // Dang xuat -> dong khung chat, lan dang nhap sau khong tu bat lai.
    this.authService.currentUser$.pipe(takeUntilDestroyed(destroyRef)).subscribe(user => {
      if (!user) this.showChat = false;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  getXpProgress(xp: number, level: number): number {
    if (level <= 1) return Math.min((xp / 100) * 100, 100);
    let totalXpNeededPrev = 0;
    for (let i = 2; i <= level; i++) {
      totalXpNeededPrev += Math.floor(100 * Math.pow(1.25, i - 2));
    }
    const xpNeededNext = Math.floor(100 * Math.pow(1.25, level - 1));
    const currentLevelXp = xp - totalXpNeededPrev;
    return Math.min(Math.max((currentLevelXp / xpNeededNext) * 100, 0), 100);
  }
}
