import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Ne pas traiter les erreurs pour les appels Keycloak (token endpoint, etc.)
        if (request.url.includes('/realms/') || request.url.includes('/openid-connect/')) {
          return throwError(() => error);
        }

        if (error.status === 401) {
          // Token expiré ou invalide — rediriger vers login sans boucle
          if (!this.authService.isLoggingOut) {
            this.authService.logout();
          }
        } else if (error.status === 403) {
          this.notification.warning('Vous n\'avez pas les droits pour effectuer cette action.');
        } else if (error.status === 409 || error.status === 400) {
          this.notification.error(error);
        } else if (error.status === 500) {
          this.notification.error('Une erreur serveur est survenue. Veuillez réessayer.');
        }

        return throwError(() => error);
      })
    );
  }
}
