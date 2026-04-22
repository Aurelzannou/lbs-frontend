import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TuteurAuthService } from '../../core/services/tuteur-auth.service';

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
        <!-- Section Parent -->
        <div class="portal-card parent-card" (click)="navigateToParent()">
          <div class="card-icon">
            <mat-icon>family_restroom</mat-icon>
          </div>
          <div class="card-content">
            <h2>Espace Parents</h2>
            <p>Inscrivez vos enfants, payez les frais de scolarité et suivez leur dossier en ligne.</p>
            <button mat-raised-button color="accent" class="action-btn">
              {{ isTuteurLoggedIn ? 'Accéder à mon espace' : 'Inscrire mon enfant' }}
            </button>
          </div>
          <div class="card-bg-icon">
            <mat-icon>child_care</mat-icon>
          </div>
        </div>

        <!-- Section Admin -->
        <div class="portal-card admin-card" (click)="navigateToAdmin()">
          <div class="card-icon">
            <mat-icon>admin_panel_settings</mat-icon>
          </div>
          <div class="card-content">
            <h2>Espace Administration</h2>
            <p>Gérez les inscriptions, le personnel, les finances et le référentiel de l'école.</p>
            <button mat-stroked-button class="action-btn outline-btn">
              {{ isAdminLoggedIn ? 'Tableau de bord' : 'Connexion Staff' }}
            </button>
          </div>
          <div class="card-bg-icon">
            <mat-icon>school</mat-icon>
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 2.5rem;
      width: 100%;
      max-width: 1000px;
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

      &:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
        
        .card-icon {
          transform: scale(1.1);
        }
        
        .card-bg-icon {
          transform: rotate(-10deg) scale(1.2);
          opacity: 0.15;
        }
      }

      .card-icon {
        width: 70px;
        height: 70px;
        border-radius: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.4s ease;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
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

      .card-bg-icon {
        position: absolute;
        right: -2rem;
        bottom: -2rem;
        font-size: 180px;
        opacity: 0.05;
        transition: all 0.4s ease;
        pointer-events: none;
        
        mat-icon {
          width: 180px;
          height: 180px;
          font-size: 180px;
        }
      }
    }

    .parent-card {
      .card-icon {
        background: #fef3c7;
        color: #d97706;
      }
      &:hover {
        border-color: #fbbf24;
      }
    }

    .admin-card {
      .card-icon {
        background: #dbeafe;
        color: #2563eb;
      }
      &:hover {
        border-color: #3b82f6;
      }
      .outline-btn {
        border: 2px solid #3b82f6;
        color: #2563eb;
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
  private authService = inject(AuthService);
  private tuteurAuthService = inject(TuteurAuthService);
  private router = inject(Router);

  get isAdminLoggedIn() {
    return this.authService.isLoggedIn;
  }

  get isTuteurLoggedIn() {
    return !!this.tuteurAuthService.currentTuteurValue;
  }

  navigateToParent() {
    if (this.isTuteurLoggedIn) {
      this.router.navigate(['/portail/dashboard']);
    } else {
      this.router.navigate(['/portail/login']);
    }
  }

  navigateToAdmin() {
    if (this.isAdminLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
