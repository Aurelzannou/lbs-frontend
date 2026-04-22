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
      <div class="background-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <header class="selection-header">
        <h1>Choisissez votre espace</h1>
        <p>Vous disposez de plusieurs accès sur la plateforme LBS Education.</p>
      </header>

      <div class="roles-grid">
        <!-- Carte Parent (Toujours présente selon votre règle) -->
        <div class="role-card parent" *ngIf="hasRole('TUTEUR')" (click)="selectProfile('PARENT')">
          <div class="icon-box">
            <mat-icon>family_restroom</mat-icon>
          </div>
          <div class="content">
            <h3>Espace Parent</h3>
            <p>Accédez aux inscriptions et dossiers de vos enfants.</p>
          </div>
          <div class="arrow">
            <mat-icon>arrow_forward</mat-icon>
          </div>
        </div>

        <!-- Carte Admin / Staff -->
        <div class="role-card admin" *ngIf="hasRole('ADMIN') || hasRole('SECRETAIRE')" (click)="selectProfile('ADMIN')">
          <div class="icon-box">
            <mat-icon>admin_panel_settings</mat-icon>
          </div>
          <div class="content">
            <h3>Administration</h3>
            <p>Gérez l'établissement et les opérations scolaires.</p>
          </div>
          <div class="arrow">
            <mat-icon>arrow_forward</mat-icon>
          </div>
        </div>
      </div>

      <button mat-button class="logout-btn" (click)="logout()">
        <mat-icon>logout</mat-icon>
        Se déconnecter
      </button>
    </div>
  `,
  styles: [`
    .selection-wrapper {
      min-height: 100vh;
      background-color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .background-blobs {
      position: absolute;
      inset: 0;
      pointer-events: none;
      .blob {
        position: absolute;
        width: 500px;
        height: 500px;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.1;
      }
      .blob-1 { background: #fbbf24; top: -100px; right: -100px; }
      .blob-2 { background: #3b82f6; bottom: -100px; left: -100px; }
    }

    .selection-header {
      text-align: center;
      margin-bottom: 3rem;
      z-index: 1;
      h1 { font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
      p { color: #64748b; font-size: 1.1rem; }
    }

    .roles-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      max-width: 500px;
      z-index: 1;
    }

    .role-card {
      background: white;
      border-radius: 1.5rem;
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #f1f5f9;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);

      &:hover {
        transform: translateX(10px);
        box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
        border-color: #3b82f6;
        .arrow { transform: translateX(5px); opacity: 1; }
      }

      .icon-box {
        width: 60px;
        height: 60px;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon { font-size: 28px; width: 28px; height: 28px; }
      }

      .content {
        flex-grow: 1;
        h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.25rem; }
        p { margin: 0; color: #64748b; font-size: 0.95rem; }
      }

      .arrow {
        opacity: 0.3;
        transition: all 0.3s ease;
        color: #3b82f6;
      }

      &.parent .icon-box { background: #fef3c7; color: #d97706; }
      &.admin .icon-box { background: #dbeafe; color: #2563eb; }
    }

    .logout-btn {
      margin-top: 3rem;
      color: #ef4444;
      font-weight: 600;
      z-index: 1;
    }
  `]
})
export class ProfileSelectionComponent implements OnInit {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  roles: string[] = [];

  ngOnInit() {
    this.roles = this.authService.getRoles();
    // Si un seul rôle, on redirige direct (optionnel, selon le besoin de forcer le choix)
    /*
    if (this.roles.length === 1) {
      this.selectProfile(this.roles[0] === 'TUTEUR' ? 'PARENT' : 'ADMIN');
    }
    */
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  selectProfile(profile: 'PARENT' | 'ADMIN') {
    if (profile === 'PARENT') {
      this.router.navigate(['/portail/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
