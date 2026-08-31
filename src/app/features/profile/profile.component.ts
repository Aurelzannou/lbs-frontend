import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="profile-container">
      <div class="header-banner"></div>

      <mat-card class="profile-card">
        <mat-card-content>
          <div class="user-info-section">
            <div class="avatar-circle">
              {{ (user?.prenom || '?')[0] }}{{ (user?.nom || '?')[0] }}
            </div>
            <div class="details">
              <h2>{{ user?.prenom }} {{ user?.nom }}</h2>
              <p class="email"><mat-icon>email</mat-icon> {{ user?.email }}</p>
              <div class="profiles-list">
                <span class="badge" *ngFor="let p of user?.profils">{{ p }}</span>
              </div>
            </div>
            <div class="actions">
              <button mat-stroked-button color="primary">
                <mat-icon>edit</mat-icon> Éditer le profil
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="row">
        <div class="col-md-6">
          <mat-card>
            <mat-card-header
              ><mat-card-title>Informations Personnelles</mat-card-title></mat-card-header
            >
            <mat-card-content>
              <div class="info-list">
                <div class="info-item"><strong>Identifiant:</strong> {{ user?.login }}</div>
                <div class="info-item"><strong>Prénom:</strong> {{ user?.prenom }}</div>
                <div class="info-item"><strong>Nom:</strong> {{ user?.nom }}</div>
                <div class="info-item"><strong>Email:</strong> {{ user?.email || 'N/A' }}</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="col-md-6">
          <mat-card>
            <mat-card-header><mat-card-title>Sécurité & Rôles</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="info-list">
                <div class="info-item">
                  <strong>Rôles Actifs:</strong>
                  <div class="badge-container">
                    <span class="badge" *ngFor="let role of user?.profils">{{ role }}</span>
                  </div>
                </div>
                <div class="info-item"><strong>Dernière Connexion:</strong> Aujourd'hui</div>
                <div class="info-item">
                  <button mat-button color="primary" type="button" (click)="openChangePassword()">
                    <mat-icon>lock_reset</mat-icon>
                    Changer le mot de passe
                  </button>
                </div>
                <div class="info-item">
                  <a
                    mat-button
                    color="primary"
                    [href]="keycloakAccountUrl"
                    target="_blank"
                    rel="noopener"
                  >
                    <mat-icon>verified_user</mat-icon>
                    Activer la double authentification
                  </a>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-container {
        padding: 0;
        max-width: 1000px;
        margin: 0 auto;
      }
      .header-banner {
        height: 150px;
        background: linear-gradient(135deg, #3366ff 0%, #8a3ffc 100%);
        border-radius: 0 0 15px 15px;
        margin-bottom: -75px;
      }
      .profile-card {
        margin-bottom: 2rem;
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }
      .user-info-section {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 2rem;
      }
      .avatar-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3366ff, #8a3ffc);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        font-weight: 700;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        text-transform: uppercase;
        flex-shrink: 0;
      }
      .info-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.5rem 0;
      }
      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .details h2 {
        margin: 0;
        font-weight: 700;
      }
      .email {
        color: #8f9bb3;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.5rem 0;
      }
      .profiles-list {
        margin-top: 0.5rem;
      }
      .actions {
        margin-left: auto;
      }
      .badge-container {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .badge {
        background: #e4e9f2;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #222b45;
      }
      @media (max-width: 768px) {
        .user-info-section {
          flex-direction: column;
          text-align: center;
        }
        .actions {
          margin: 1rem auto 0;
        }
      }
    `
  ]
})
export class UserProfileComponent implements OnInit {
  user: any;

  /**
   * Console "Mon compte" de Keycloak, page « Connexion » : utilisée pour configurer
   * la double authentification. Le changement de mot de passe, lui, se fait via une
   * boîte de dialogue interne (endpoint backend), sans exposer les pages Keycloak.
   */
  readonly keycloakAccountUrl = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/account/#/security/signing-in`;

  private dialog = inject(MatDialog);

  constructor(private authService: AuthService) {}

  openChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '440px',
      autoFocus: 'input',
      disableClose: false
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (userData: any) => {
        this.user = userData;
      },
      error: (err: any) => {
        console.error('Erreur récupération profil:', err);
      }
    });
  }
}
