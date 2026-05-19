import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="home-wrapper">
      <div class="background-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <header class="home-header">
        <div class="logo-container">
          <div class="logo-circle">LBS</div>
          <h1>LBS Education</h1>
        </div>
        <p class="subtitle">La plateforme intégrée pour une gestion scolaire d'excellence.</p>
      </header>

      <main class="portal-selection">
        <div class="portal-card single-card" (click)="navigate()">
          <div class="card-icon">
            <mat-icon>school</mat-icon>
          </div>
          <div class="card-content">
            <h2>Accéder à la plateforme</h2>
            <p>Connectez-vous pour gérer les inscriptions, suivre les dossiers scolaires et accéder à tous les outils.</p>
            <button mat-raised-button class="action-btn main-btn">
              {{ isLoggedIn ? 'Mon tableau de bord' : 'Se connecter' }}
            </button>
          </div>
          <div class="card-bg-icon">
            <mat-icon>auto_stories</mat-icon>
          </div>
        </div>
      </main>

      <footer class="home-footer">
        <p>&copy; 2026 LBS Education System. Tous droits réservés.</p>
      </footer>
    </div>
  `,
  styles: [`
    .home-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f8fafc;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      font-family: 'Outfit', sans-serif;
    }

    .background-blobs {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      pointer-events: none;
      
      .blob {
        position: absolute;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.15;
      }
      .blob-1 { background: #fbbf24; top: -100px; right: -100px; }
      .blob-2 { background: #3b82f6; bottom: -100px; left: -100px; }
    }

    .home-header {
      text-align: center;
      margin-bottom: 4rem;
      position: relative;
      z-index: 1;

      .logo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .logo-circle {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        color: white;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 1.5rem;
        box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.3);
      }

      h1 {
        font-size: 3rem;
        font-weight: 900;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .subtitle {
        font-size: 1.25rem;
        color: #64748b;
        max-width: 500px;
      }
    }

    .portal-selection {
      display: flex;
      justify-content: center;
      width: 100%;
      max-width: 520px;
      position: relative;
      z-index: 1;
    }

    .portal-card {
      background: white;
      border-radius: 2rem;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      border: 1px solid #f1f5f9;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      width: 100%;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px -15px rgba(30, 58, 138, 0.15);
        border-color: #3b82f6;

        .card-icon { transform: scale(1.1); }
        .card-bg-icon { transform: rotate(-10deg) scale(1.2); opacity: 0.1; }
      }

      .card-icon {
        width: 70px;
        height: 70px;
        border-radius: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.4s ease;
        background: #dbeafe;
        color: #2563eb;

        mat-icon { font-size: 32px; width: 32px; height: 32px; }
      }

      .card-content {
        position: relative;
        z-index: 2;

        h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.75rem;
        }

        p {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 1.05rem;
        }
      }

      .action-btn {
        height: 3.5rem;
        padding: 0 2.5rem;
        border-radius: 1rem;
        font-weight: 700;
        font-size: 1rem;
        text-transform: none;
      }

      .main-btn {
        background: linear-gradient(135deg, #1e3a8a, #2563eb) !important;
        color: white !important;
        box-shadow: 0 8px 20px -5px rgba(37, 99, 235, 0.4);
      }

      .card-bg-icon {
        position: absolute;
        right: -2rem;
        bottom: -2rem;
        opacity: 0.05;
        transition: all 0.4s ease;
        pointer-events: none;

        mat-icon { width: 180px; height: 180px; font-size: 180px; }
      }
    }

    .home-footer {
      margin-top: 5rem;
      color: #94a3b8;
      font-size: 0.9rem;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 640px) {
      .home-header h1 { font-size: 2.25rem; }
      .portal-selection { grid-template-columns: 1fr; }
      .portal-card { padding: 2rem; }
    }
  `]
})
export class HomeComponent {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  get isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  navigate() {
    if (this.authService.isLoggedIn) {
      const roles = this.authService.getBusinessRoles();
      this.authService.redirectAfterLogin(roles);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
