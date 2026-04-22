import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-selection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="selection-wrapper">
      <!-- Arrière-plan animé et premium -->
      <div class="background-decor">
        <div class="glow glow-1"></div>
        <div class="glow glow-2"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="content-container">
        <header class="selection-header">
          <div class="logo-badge">LBS</div>
          <h1>Bienvenue, {{ userName }}</h1>
          <p>Veuillez sélectionner l'espace de travail pour continuer</p>
        </header>

        <div class="roles-container">
          <!-- Carte Parent -->
          <div class="profile-card parent-theme" *ngIf="hasRole('TUTEUR')" (click)="selectProfile('TUTEUR')">
            <div class="card-glass"></div>
            <div class="icon-container">
              <mat-icon>family_restroom</mat-icon>
            </div>
            <div class="card-body">
              <h3>Portail Parent</h3>
              <p>Inscriptions, suivi des dossiers et paiements de vos enfants.</p>
            </div>
            <div class="card-action">
              <span>Accéder</span>
              <mat-icon>chevron_right</mat-icon>
            </div>
          </div>

          <!-- Carte Admin -->
          <div class="profile-card admin-theme" *ngIf="hasRole('ADMIN') || hasRole('SECRETAIRE')" (click)="selectProfile('ADMIN')">
            <div class="card-glass"></div>
            <div class="icon-container">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
            <div class="card-body">
              <h3>Administration</h3>
              <p>Gestion globale de l'établissement, scolarité et référentiels.</p>
            </div>
            <div class="card-action">
              <span>Accéder</span>
              <mat-icon>chevron_right</mat-icon>
            </div>
          </div>
        </div>

        <button mat-button class="logout-action" (click)="logout()">
          <mat-icon>logout</mat-icon>
          Déconnexion
        </button>
      </div>

      <footer class="selection-footer">
        &copy; 2024 LBS Education. Tous droits réservés.
      </footer>
    </div>
  `,
  styles: [`
    :host {
      --primary-blue: #2563eb;
      --primary-amber: #f59e0b;
      --bg-slate: #0f172a;
      --glass-white: rgba(255, 255, 255, 0.03);
      --glass-border: rgba(255, 255, 255, 0.1);
    }

    .selection-wrapper {
      min-height: 100vh;
      background-color: var(--bg-slate);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      font-family: 'Outfit', sans-serif;
    }

    /* Décorations de fond */
    .background-decor {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .glow {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.15;
    }

    .glow-1 { background: var(--primary-blue); top: -200px; left: -100px; }
    .glow-2 { background: var(--primary-amber); bottom: -200px; right: -100px; }

    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at center, black, transparent 80%);
    }

    .content-container {
      width: 100%;
      max-width: 900px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .selection-header {
      text-align: center;
      margin-bottom: 4rem;
      animation: fadeInDown 0.8s ease-out;

      .logo-badge {
        display: inline-block;
        background: linear-gradient(135deg, var(--primary-blue), #60a5fa);
        padding: 0.5rem 1rem;
        border-radius: 0.75rem;
        font-weight: 900;
        letter-spacing: 2px;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
      }

      h1 { font-size: 3rem; font-weight: 800; margin-bottom: 0.75rem; color: white; }
      p { font-size: 1.25rem; color: #94a3b8; font-weight: 400; }
    }

    .roles-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 2rem;
      width: 100%;
      margin-bottom: 4rem;
    }

    .profile-card {
      position: relative;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--glass-border);
      border-radius: 2rem;
      padding: 2.5rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      overflow: hidden;

      &:hover {
        transform: translateY(-10px) scale(1.02);
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

        .card-action mat-icon { transform: translateX(5px); }
        .icon-container { transform: scale(1.1) rotate(5deg); }
      }

      .icon-container {
        width: 70px;
        height: 70px;
        border-radius: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s ease;
        mat-icon { font-size: 36px; width: 36px; height: 36px; }
      }

      .card-body {
        h3 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; }
        p { color: #94a3b8; line-height: 1.6; font-size: 1.05rem; }
      }

      .card-action {
        margin-top: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        mat-icon { transition: all 0.3s ease; }
      }

      &.parent-theme {
        .icon-container { background: rgba(245, 158, 11, 0.1); color: var(--primary-amber); }
        .card-action { color: var(--primary-amber); }
        &:hover { border-color: rgba(245, 158, 11, 0.3); }
      }

      &.admin-theme {
        .icon-container { background: rgba(37, 99, 235, 0.1); color: var(--primary-blue); }
        .card-action { color: var(--primary-blue); }
        &:hover { border-color: rgba(37, 99, 235, 0.3); }
      }
    }

    .logout-action {
      color: #94a3b8;
      font-weight: 600;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 1rem;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
      }
    }

    .selection-footer {
      margin-top: auto;
      padding-top: 2rem;
      color: #64748b;
      font-size: 0.875rem;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .roles-container { grid-template-columns: 1fr; }
      .selection-header h1 { font-size: 2rem; }
    }
  `]
})
export class ProfileSelectionComponent implements OnInit {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  roles: string[] = [];
  userName: string = '';

  ngOnInit() {
    this.roles = this.authService.getBusinessRoles();
    this.userName = this.authService.userProfile?.firstName || 'Utilisateur';
    
    // Si un seul rôle métier après filtrage, on redirige directement
    if (this.roles.length === 1) {
      this.selectProfile(this.roles[0] === 'TUTEUR' ? 'TUTEUR' : 'ADMIN');
    }
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  selectProfile(profile: 'TUTEUR' | 'ADMIN') {
    this.authService.setSelectedProfile(profile);
    
    if (profile === 'TUTEUR') {
      this.router.navigate(['/portail/dashboard']).then(() => {
        window.location.reload(); // Recharger pour rafraîchir les menus
      });
    } else {
      this.router.navigate(['/dashboard']).then(() => {
        window.location.reload(); // Recharger pour rafraîchir les menus
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
