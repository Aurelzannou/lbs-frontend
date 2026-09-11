import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { OneColumnLayoutComponent } from './@theme/layouts/one-column-layout.component';
import { AuthService } from './core/services/auth.service';
import { MenuService } from './core/services/menu.service';
import { NotificationService } from './core/services/notification.service';
import { PwaService } from './core/services/pwa.service';
import { KeycloakService, KeycloakEventTypeLegacy } from 'keycloak-angular';
import { filter } from 'rxjs/operators';

export interface MenuItem {
  title: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OneColumnLayoutComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'lbs-frontend';
  menu: MenuItem[] = [];
  showLayout = true;

  private noLayoutPaths = [
    '/login',
    '/register',
    '/auth',
    '/home',
    '/portail',
    '/activer-compte',
    '/mot-de-passe-oublie',
    '/reinitialiser-mot-de-passe'
  ];
  private lastLoadedProfile: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private keycloak: KeycloakService,
    private notification: NotificationService,
    /** Instancié dès le démarrage : surveille les mises à jour du service worker et la connexion. */
    public pwa: PwaService
  ) {
    this.surveillerExpirationSession();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.showLayout = !this.noLayoutPaths.some((path) => url.includes(path));

        if (this.showLayout && this.authService.isLoggedIn) {
          const currentProfile = this.authService.getSelectedProfile();
          if (this.menu.length === 0 || currentProfile !== this.lastLoadedProfile) {
            this.loadMenu();
            this.lastLoadedProfile = currentProfile;
          }
        }
      });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.loadMenu();
      this.lastLoadedProfile = this.authService.getSelectedProfile();
    }
  }

  /**
   * Quand la session Keycloak expire et ne peut plus être rafraîchie (jeton de rafraîchissement
   * périmé), l'application se retrouve sur une page « morte » : les requêtes échouent en silence
   * et les boutons ne font rien (ex. « Refuser un dossier »). On force alors le retour à la page
   * de connexion avec un message explicite au lieu de laisser l'utilisateur bloqué.
   */
  private surveillerExpirationSession(): void {
    this.keycloak.keycloakEvents$.subscribe((event) => {
      const type = event?.type;

      if (
        type === KeycloakEventTypeLegacy.OnAuthRefreshError ||
        type === KeycloakEventTypeLegacy.OnAuthLogout
      ) {
        this.forcerReconnexion();
      }

      if (type === KeycloakEventTypeLegacy.OnTokenExpired) {
        // On tente un dernier rafraîchissement ; s'il échoue, la session est bel et bien finie.
        this.keycloak.updateToken(20).catch(() => this.forcerReconnexion());
      }
    });
  }

  private forcerReconnexion(): void {
    if (this.authService.isLoggingOut) return;
    if (this.router.url.includes('/login')) return;
    this.notification.warning('Votre session a expiré. Veuillez vous reconnecter.');
    this.authService.logout();
  }

  private loadMenu(): void {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menu = items;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du menu:', err);
      }
    });
  }
}
