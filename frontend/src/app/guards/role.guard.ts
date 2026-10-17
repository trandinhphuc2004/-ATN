import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Chan truy cap theo vai tro. Khai bao vai tro cho phep qua route data:
 *   { path: '...', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN', 'TEACHER'] } }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data?.['roles'] ?? [];
  const role = authService.getCurrentUser()?.role;

  if (role && allowedRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
