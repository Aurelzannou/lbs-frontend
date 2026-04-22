import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const tuteurGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    return router.parseUrl('/login');
  }

  // Lire les rôles depuis le JWT stocké — cohérent avec la logique de redirection du login
  const storedToken = localStorage.getItem('access_token');
  const businessRoles = storedToken
    ? authService.getRolesFromToken(storedToken)
    : authService.getBusinessRoles();

  if (businessRoles.includes('TUTEUR')) {
    return true;
  }

  // Un admin sans rôle TUTEUR n'a pas accès au portail parent
  return router.parseUrl('/dashboard');
};
