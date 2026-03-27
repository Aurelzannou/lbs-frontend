import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private readonly keycloak: KeycloakService) {}

  public get isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  public login(): void {
    this.keycloak.login();
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
}
