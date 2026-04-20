import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { from, Observable, tap, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly keycloak: KeycloakService,
    private http: HttpClient,
    private router: Router
  ) {}

  public get isLoggedIn(): boolean {
    try {
      return this.keycloak.isLoggedIn();
    } catch (e) {
      console.warn('Keycloak not initialized yet or error:', e);
      return false;
    }
  }

  get userProfile(): KeycloakProfile | undefined {
    return this.keycloak.getKeycloakInstance().profile;
  }

  public login(): void {
    this.router.navigate(['/login']);
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    this.keycloak.logout(window.location.origin);
  }

  public getUserProfile(): Observable<KeycloakProfile | null> {
    if (!this.isLoggedIn) {
      return from(Promise.resolve(null));
    }
    return from(this.keycloak.loadUserProfile().catch(err => {
      console.error('Erreur lors de la récupération du profil:', err);
      return null;
    }));
  }

  public getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  public getRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  /**
   * Login avec identifiants (Direct Access Grant)
   */
  public loginWithCredentials(username: string, password: string): Observable<any> {
    const url = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`;
    
    const body = new HttpParams()
      .set('client_id', environment.keycloak.clientId)
      .set('grant_type', 'password')
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(url, body.toString(), { headers }).pipe(
      tap((response: any) => {
        // Persister les tokens pour le rafraîchissement (F5)
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        if (response.id_token) localStorage.setItem('id_token', response.id_token);
      }),
      switchMap((response: any) => {
        console.log('Login réussi via API, synchronisation Keycloak...');
        
        return from(this.keycloak.init({
          config: {
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId
          },
          initOptions: {
            token: response.access_token,
            refreshToken: response.refresh_token,
            idToken: response.id_token,
            onLoad: 'check-sso',
            checkLoginIframe: false
          }
        }));
      }),
      switchMap(() => from(this.keycloak.loadUserProfile()))
    );
  }

  /**
   * Récupération des informations de l'utilisateur connecté depuis le backend
   */
  public getCurrentUser(): Observable<any> {
    const url = `${environment.apiUrl}/api/auth/me`;
    return this.http.get<any>(url);
  }

  /**
   * Inscription d'un nouvel utilisateur via le backend
   */
  public register(userData: any): Observable<any> {
    const url = `${environment.apiUrl}/api/auth/register`;
    return this.http.post(url, userData, { responseType: 'text' as 'json' });
  }
}
