import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TuteurAuthService {
  private router = inject(Router);

  private tuteurSubject = new BehaviorSubject<any>(null);
  public tuteur$ = this.tuteurSubject.asObservable();

  public get currentTuteurValue(): any {
    return this.tuteurSubject.value;
  }

  constructor() {
    const savedTuteur = localStorage.getItem('tuteur_data');
    if (savedTuteur) {
      this.tuteurSubject.next(JSON.parse(savedTuteur));
    }
  }

  private authService = inject(AuthService);

  public get isTuteurLoggedIn(): boolean {
    return this.authService.isLoggedIn && this.authService.getRoles().includes('TUTEUR');
  }

  login(credentials: any): Observable<any> {
    // On utilise maintenant le login Keycloak via AuthService
    return this.authService.loginWithCredentials(credentials.email, credentials.password).pipe(
      tap((response) => {
        // Optionnel : stocker des infos spécifiques tuteur si besoin
        localStorage.setItem('tuteur_data', JSON.stringify(response.profile));
        this.tuteurSubject.next(response.profile);
      })
    );
  }

  logout(): void {
    this.tuteurSubject.next(null);
    this.authService.logout('/portail/login');
  }

  getToken(): string | null {
    // On retourne le token Keycloak maintenant
    return localStorage.getItem('access_token');
  }
}
