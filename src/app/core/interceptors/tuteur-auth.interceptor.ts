import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TuteurAuthService } from '../services/tuteur-auth.service';

@Injectable()
export class TuteurAuthInterceptor implements HttpInterceptor {
  private tuteurAuth = inject(TuteurAuthService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tuteurAuth.getToken();
    
    // Si c'est une route du portail et qu'on a un token tuteur
    if (request.url.includes('/api/portail') && token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
