import { Injectable, NgZone, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, UpdateProfileRequest, User } from '../models/models';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'chemlab_token';
const USER_KEY = 'chemlab_user';

/** Thoi gian lop phu "Dang dang xuat" che trang cu truoc khi chuyen trang (ms). */
const LOGOUT_FADE_MS = 280;

export type LogoutReason = 'manual' | 'expired' | 'other-tab';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  /** true trong luc dang xuat: AppComponent hien lop phu mo de chuyen trang muot. */
  readonly loggingOut = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private zone: NgZone
  ) {
    this.loadStoredUser();
    this.listenOtherTabs();
  }

  private loadStoredUser(): void {
    if (this.isTokenExpired(this.getToken())) {
      this.clearSession();
      return;
    }
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  /** Dang xuat o tab khac (xoa token trong localStorage) -> tab nay cung dang xuat theo. */
  private listenOtherTabs(): void {
    window.addEventListener('storage', event => {
      if (event.key === TOKEN_KEY && !event.newValue && this.currentUserSubject.value) {
        this.zone.run(() => this.logout('other-tab'));
      }
    });
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuth(response))
    );
  }

  /**
   * Dang xuat va dua nguoi dung ve trang dang nhap.
   * Truoc day chi xoa token nen nguoi dung van dung o trang cu (vd. /dashboard) voi du lieu cu.
   * Thu tu: hien lop phu -> xoa phien -> dieu huong (replaceUrl de nut Back khong quay lai
   * trang can dang nhap) -> an lop phu -> thong bao.
   */
  logout(reason: LogoutReason = 'manual'): void {
    if (this.loggingOut()) return;

    // Phien het han: giu lai URL hien tai de dang nhap xong quay lai dung cho cu.
    const returnUrl = reason === 'expired' ? this.router.url : null;

    this.loggingOut.set(true);
    setTimeout(() => {
      this.clearSession();
      this.router.navigate(['/login'], {
        replaceUrl: true,
        queryParams: returnUrl && returnUrl !== '/login' ? { returnUrl } : {}
      }).finally(() => {
        this.loggingOut.set(false);
        this.notifyLogout(reason);
      });
    }, reason === 'manual' ? LOGOUT_FADE_MS : 0);
  }

  private notifyLogout(reason: LogoutReason): void {
    const key = {
      manual: 'AUTH.LOGGED_OUT',
      expired: 'AUTH.SESSION_EXPIRED',
      'other-tab': 'AUTH.LOGGED_OUT_OTHER_TAB'
    }[reason];
    this.snackBar.open(
      this.translate.instant(key),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000, panelClass: reason === 'expired' ? 'snack-warn' : 'snack-info' }
    );
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /** Doc claim "exp" cua JWT. Token hong/khong doc duoc coi nhu da het han. */
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload));
      return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Tai lai thong tin nguoi dung tu may chu. Lop cua hoc sinh do quan tri vien gan
   * co the thay doi sau khi dang nhap, nen khong chi dua vao ban luu trong localStorage.
   */
  refreshCurrentUser(): void {
    if (!this.isLoggedIn()) return;
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: () => {}
    });
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, request).pipe(
      tap(user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  private handleAuth(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }
}
