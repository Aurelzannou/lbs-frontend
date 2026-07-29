import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const professeurGuard = () => {
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

  if (businessRoles.includes('PROFESSEUR')) {
    return true;
  }

  // Un utilisateur sans rôle PROFESSEUR n'a pas accès au portail professeur
  return router.parseUrl('/dashboard');
};
