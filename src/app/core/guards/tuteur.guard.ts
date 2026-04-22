import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TuteurAuthService } from '../services/tuteur-auth.service';

export const tuteurGuard = () => {
  const authService = inject(TuteurAuthService);
  const router = inject(Router);

  if (authService.isTuteurLoggedIn) {
    return true;
  }

  return router.parseUrl('/portail/login');
};
