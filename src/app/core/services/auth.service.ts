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
  /** Flag pour indiquer qu'une déconnexion est en cours (transition vers Keycloak logout) */
  public isLoggingOut = false;

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

  public logout(targetRoute: string = '/login'): void {
    // Nettoyer le stockage local (tous les systèmes)
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('tuteur_token');
    localStorage.removeItem('tuteur_data');

    // Flag pour empêcher les composants Login de rediriger pendant la phase transitoire
    this.isLoggingOut = true;

    // Naviguer vers la route cible avant que Keycloak invalide la session
    this.router.navigate([targetRoute]).then(() => {
      setTimeout(() => {
        this.isLoggingOut = false;
        // Déconnexion Keycloak avec redirection vers l'origine + route cible
        this.keycloak.logout(window.location.origin + targetRoute);
      }, 150);
    });
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
   * Retourne uniquement les rôles métier (TUTEUR, ADMIN, SECRETAIRE, etc.)
   * en filtrant les rôles techniques de Keycloak.
   */
  public getBusinessRoles(): string[] {
    const roles = this.getRoles();
    const technicalRoles = [
      'offline_access', 
      'uma_authorization', 
      'default-roles-lbs',
      'account',
      'manage-account',
      'view-profile',
      'manage-account-links'
    ];
    return roles.filter(role => 
      !technicalRoles.includes(role) && 
      !role.startsWith('default-roles-')
    );
  }

  /**
   * Décode un JWT et retourne son payload.
   */
  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch {
      return null;
    }
  }

  /**
   * Extrait les rôles métier directement depuis le JWT (sans dépendre de keycloak.getUserRoles()).
   * Fiable immédiatement après loginWithCredentials().
   */
  public getRolesFromToken(accessToken: string): string[] {
    const payload = this.decodeJwt(accessToken);
    if (!payload) return [];

    // Les rôles realm sont dans payload.realm_access.roles
    const realmRoles: string[] = payload?.realm_access?.roles ?? [];
    // Les rôles ressource (client) sont dans payload.resource_access.<clientId>.roles
    const clientId = environment.keycloak.clientId;
    const clientRoles: string[] = payload?.resource_access?.[clientId]?.roles ?? [];

    const allRoles = [...new Set([...realmRoles, ...clientRoles])];

    const technicalRoles = [
      'offline_access',
      'uma_authorization',
      'default-roles-lbs',
      'account',
      'manage-account',
      'view-profile',
      'manage-account-links'
    ];

    return allRoles.filter(role =>
      !technicalRoles.includes(role) &&
      !role.startsWith('default-roles-')
    );
  }

  /**
   * Login avec identifiants (Direct Access Grant).
   * Émet le profil Keycloak et expose les rôles via getRolesFromToken() immédiatement.
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
        })).pipe(
          // On retourne la réponse originale pour que le composant puisse accéder à l'access_token
          switchMap(() => from(this.keycloak.loadUserProfile())),
          // On enrichit le résultat avec les rôles extraits du token brut
          switchMap(async (profile) => ({
            profile,
            accessToken: response.access_token,
            businessRoles: this.getRolesFromToken(response.access_token)
          }))
        );
      })
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

  /**
   * Centralise la logique de redirection après connexion selon les rôles
   */
  public redirectAfterLogin(roles: string[]): void {
    const isTuteur = roles.includes('TUTEUR');
    const isAdmin  = roles.includes('ADMIN') || roles.includes('SECRETAIRE');

    // Si un profil est déjà sélectionné (ex: refresh), on l'utilise
    const selectedProfile = this.getSelectedProfile();
    if (selectedProfile) {
      this.navigateToProfile(selectedProfile);
      return;
    }

    if (isTuteur && !isAdmin) {
      this.setSelectedProfile('TUTEUR');
      this.router.navigate(['/portail/dashboard']);
    } else if (isAdmin && !isTuteur) {
      this.setSelectedProfile('ADMIN');
      this.router.navigate(['/dashboard']);
    } else if (isTuteur && isAdmin) {
      this.router.navigate(['/auth/select-profile']);
    } else {
      // Par défaut si pas de rôle reconnu
      this.setSelectedProfile('TUTEUR');
      this.router.navigate(['/portail/dashboard']);
    }
  }

  public setSelectedProfile(profile: string): void {
    localStorage.setItem('selectedProfile', profile);
  }

  public getSelectedProfile(): string | null {
    return localStorage.getItem('selectedProfile');
  }

  private navigateToProfile(profile: string): void {
    if (profile === 'TUTEUR') {
      this.router.navigate(['/portail/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
