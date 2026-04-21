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
        if ([401, 403].includes(error.status)) {
          this.authService.logout();
        }
        
        // Notification automatique pour les erreurs de conflit (doublons) ou autres erreurs API
        if (error.status === 409 || error.status === 400 || error.status === 500) {
          this.notification.error(error);
        }

        const errorMessage = error.error?.message || error.statusText;
        console.error('API Error:', errorMessage);
        return throwError(() => error);
      })
    );
  }
}
