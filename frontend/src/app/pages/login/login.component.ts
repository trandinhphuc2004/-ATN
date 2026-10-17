import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule,
    TranslateModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <mat-icon>science</mat-icon>
          </div>
          <h1>{{ 'LOGIN.WELCOME' | translate }}</h1>
          <p>{{ 'LOGIN.SUBTITLE' | translate }}</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
          <div class="form-group">
            <label for="email">{{ 'LOGIN.EMAIL' | translate }}</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
                   required email placeholder="you@example.com" class="form-input">
          </div>

          <div class="form-group">
            <label for="password">{{ 'LOGIN.PASSWORD' | translate }}</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
                   required placeholder="••••••••" class="form-input">
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || !loginForm.valid">
            @if (loading) {
              <mat-spinner diameter="18"></mat-spinner>
            } @else {
              {{ 'LOGIN.SIGN_IN_BTN' | translate }}
            }
          </button>
        </form>

        <!-- Khong co dang ky cong khai: tai khoan do quan tri vien cap -->
        <p class="auth-footer">{{ 'LOGIN.ACCOUNT_HINT' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 68px);
      background: #f2f0eb;
      padding: 24px;
    }

    .auth-card {
      width: 400px;
      max-width: 100%;
      background: white;
      border-radius: 12px;
      padding: 40px 36px;
      box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24);
      animation: card-in 0.35s cubic-bezier(0.165, 0.84, 0.44, 1) both;
    }

    @keyframes card-in {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
    }

    @media (prefers-reduced-motion: reduce) {
      .auth-card { animation: none; }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #1E3932;
      color: white;
      margin-bottom: 18px;
    }

    .auth-logo mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .auth-header h1 {
      font-size: 1.375rem;
      font-weight: 700;
      color: #006241;
      margin: 0 0 6px;
      letter-spacing: -0.01em;
    }

    .auth-header p {
      font-size: 0.9rem;
      color: rgba(0,0,0,0.58);
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: rgba(0,0,0,0.70);
      letter-spacing: -0.01em;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      font-size: 15px;
      font-family: inherit;
      border: 1px solid #d6dbde;
      border-radius: 8px;
      background: #f9f9f9;
      color: rgba(0,0,0,0.87);
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
      letter-spacing: -0.01em;
    }

    .form-input::placeholder { color: rgba(0,0,0,0.35); }

    .form-input:focus {
      border-color: #00754A;
      box-shadow: 0 0 0 3px rgba(0,117,74,0.12);
      background: white;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 11px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      color: white;
      background: #00754A;
      border: 1px solid #00754A;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 4px;
      letter-spacing: -0.01em;
    }

    .btn-primary:hover:not(:disabled) {
      background: #006241;
      border-color: #006241;
    }

    .btn-primary:active:not(:disabled) {
      transform: scale(0.95);
    }

    .btn-primary:disabled {
      opacity: 0.50;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      font-size: 13px;
      color: rgba(0,0,0,0.58);
      margin-top: 22px;
      letter-spacing: -0.01em;
    }

    .auth-footer a {
      color: #00754A;
      font-weight: 600;
      text-decoration: none;
    }

    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  onLogin(): void {
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        // replaceUrl: bam Back sau khi dang nhap khong quay lai form dang nhap
        this.router.navigateByUrl(this.safeReturnUrl(), { replaceUrl: true });
        this.snackBar.open(this.translate.instant('LOGIN.SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.error || this.translate.instant('LOGIN.FAILED');
        this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

  /** Chi chap nhan duong dan noi bo (bat dau bang "/", khong phai "//host") de tranh open redirect. */
  private safeReturnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login')
      ? url
      : '/home';
  }
}
