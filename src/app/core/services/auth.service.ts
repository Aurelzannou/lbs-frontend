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
    return this.keycloak.isLoggedIn();
  }

  public login(): void {
    this.router.navigate(['/login']);
  }

  public logout(): void {
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
        // Optionnel : On peut stocker les tokens manuellement ou les injecter dans KeycloakService
        // Cependant, KeycloakService d'angular-keycloak est très lié au flux de redirection.
        // Pour une approche simple, on recharge l'init de Keycloak avec les tokens reçus
        console.log('Login réussi via API');
      }),
      switchMap(() => {
        // Une fois authentifié via API, on peut essayer de rafraîchir le profil utilisateur
        return from(this.keycloak.loadUserProfile());
      })
    );
  }
}
