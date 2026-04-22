import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const tuteurGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn && authService.getRoles().includes('TUTEUR')) {
    return true;
  }

  return router.parseUrl('/login');
};
