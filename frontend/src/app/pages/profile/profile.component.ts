import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { User, UpdateProfileRequest } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon"><mat-icon>person</mat-icon></div>
        <div>
          <h1>{{ 'PROFILE.TITLE' | translate }}</h1>
          <p>{{ 'PROFILE.SUBTITLE' | translate }}</p>
        </div>
      </div>

      @if (user) {
        <div class="profile-card">
          <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
          <div class="user-meta">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
            <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">{{ user.role }}</span>
          </div>
          <div class="xp-info">
            <div class="xp-item">
              <mat-icon>star</mat-icon>
              <span>{{ 'PROFILE.LEVEL' | translate:{level: user.level} }}</span>
            </div>
            <div class="xp-item">
              <mat-icon>bolt</mat-icon>
              <span>{{ user.xp }} XP</span>
            </div>
          </div>
        </div>

        <div class="form-card">
          <h2>{{ 'PROFILE.EDIT_INFO' | translate }}</h2>
          <div class="form-group">
            <label>{{ 'PROFILE.DISPLAY_NAME' | translate }}</label>
            <input [(ngModel)]="form.name" [placeholder]="'PROFILE.PH_DISPLAY_NAME' | translate" />
          </div>

          <div class="divider"></div>

          <h2>{{ 'PROFILE.CHANGE_PASSWORD' | translate }}</h2>
          <div class="form-group">
            <label>{{ 'PROFILE.CURRENT_PASSWORD' | translate }}</label>
            <input [(ngModel)]="form.currentPassword" type="password" [placeholder]="'PROFILE.PH_CURRENT_PASSWORD' | translate" />
          </div>
          <div class="form-group">
            <label>{{ 'PROFILE.NEW_PASSWORD' | translate }}</label>
            <input [(ngModel)]="form.newPassword" type="password" [placeholder]="'PROFILE.PH_NEW_PASSWORD' | translate" />
          </div>
          <div class="form-group">
            <label>{{ 'PROFILE.CONFIRM_PASSWORD' | translate }}</label>
            <input [(ngModel)]="form.confirmPassword" type="password" [placeholder]="'PROFILE.PH_CONFIRM_PASSWORD' | translate" />
          </div>

          @if (errorMsg) {
            <div class="alert error">{{ errorMsg }}</div>
          }
          @if (successMsg) {
            <div class="alert success">{{ successMsg }}</div>
          }

          <button class="btn-primary" (click)="save()" [disabled]="saving">
            @if (saving) { <mat-spinner diameter="18"></mat-spinner> }
            {{ (saving ? 'COMMON.SAVING' : 'PROFILE.SAVE_CHANGES') | translate }}
          </button>
        </div>

        @if (user.role === 'ADMIN' && user.badges && user.badges.length > 0) {
          <div class="form-card badges-card">
            <h2>{{ 'PROFILE.BADGES' | translate }}</h2>
            <div class="badges-list">
              @for (badge of user.badges; track badge) {
                <span class="badge"><mat-icon>emoji_events</mat-icon> {{ badge }}</span>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-text); margin: 0 auto; padding: 40px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .page-header p { font-size: 0.9rem; color: rgba(0,0,0,0.58); margin: 0; }
    .profile-card { display: flex; align-items: center; gap: 20px; background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; flex-wrap: wrap; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: #1E3932; color: white; font-size: 1.4rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .user-meta { flex: 1; }
    .user-name { font-size: 1.05rem; font-weight: 700; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .user-email { font-size: 13px; color: rgba(0,0,0,0.58); margin: 2px 0 8px; }
    .role-badge { padding: 3px 10px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
    .role-student { background: #d4e9e2; color: #006241; }
    .role-teacher { background: #d4e9e2; color: #006241; }
    .role-admin { background: #faf6ee; color: #a07c3e; }
    .xp-info { display: flex; gap: 16px; }
    .xp-item { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .xp-item mat-icon { font-size: 16px; width: 16px; height: 16px; color: #cba258; }
    .form-card { background: white; border-radius: 12px; padding: 28px; margin-bottom: 20px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .form-card h2 { font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 20px; letter-spacing: -0.01em; }
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
    .form-group label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .form-group input { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; background: #f9f9f9; color: rgba(0,0,0,0.87); transition: border-color 0.2s; }
    .form-group input:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .divider { height: 1px; background: #edebe9; margin: 24px 0; }
    .alert { padding: 12px 16px; border-radius: 9px; font-size: 14px; margin-bottom: 16px; }
    .alert.error { background: rgba(200,32,20,0.06); color: #c82014; }
    .alert.success { background: #d4e9e2; color: #006241; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-primary:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .btn-primary:active { transform: scale(0.95); }
    .btn-primary:disabled { opacity: 0.50; cursor: not-allowed; }
    .badges-card h2 { margin-bottom: 16px; }
    .badges-list { display: flex; flex-wrap: wrap; gap: 10px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #faf6ee; color: #a07c3e; border-radius: 50px; font-size: 13px; font-weight: 600; border: 1px solid #dfc49d; }
    .badge mat-icon { font-size: 15px; width: 15px; height: 15px; color: #cba258; }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  form: any = { name: '', currentPassword: '', newPassword: '', confirmPassword: '' };
  saving = false;
  errorMsg = '';
  successMsg = '';

  constructor(private authService: AuthService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) this.form.name = this.user.name;
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.form.name = u.name;
    });
  }

  save(): void {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
      this.errorMsg = this.translate.instant('PROFILE.ERR_MISMATCH');
      return;
    }
    const req: UpdateProfileRequest = {};
    if (this.form.name && this.form.name !== this.user?.name) req.name = this.form.name;
    if (this.form.newPassword) {
      req.currentPassword = this.form.currentPassword;
      req.newPassword = this.form.newPassword;
    }
    if (!req.name && !req.newPassword) {
      this.errorMsg = this.translate.instant('PROFILE.ERR_NOTHING');
      return;
    }
    this.saving = true;
    this.authService.updateProfile(req).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = this.translate.instant('PROFILE.SUCCESS');
        this.form.currentPassword = '';
        this.form.newPassword = '';
        this.form.confirmPassword = '';
      },
      error: (e) => {
        this.saving = false;
        this.errorMsg = e?.error?.message || this.translate.instant('PROFILE.ERR_UPDATE');
      }
    });
  }
}
