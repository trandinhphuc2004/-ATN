import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const request = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      // Spring Security chua cau hinh entry point nen token het han tra ve 403 (khong phai 401).
      // Chi coi la het phien khi 401, hoac 403 ma token thuc su da het han -> tranh dang xuat
      // nham khi giao vien bi tu choi xem lop khong duoc phan cong (403 hop le).
      const sessionGone = !!token && !req.url.endsWith('/auth/login') && (
        err.status === 401 || (err.status === 403 && authService.isTokenExpired(token))
      );
      if (sessionGone) {
        authService.logout('expired');
      }
      return throwError(() => err);
    })
  );
};
