import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NbCardModule, 
  NbUserModule, 
  NbIconModule, 
  NbButtonModule,
  NbTagModule,
  NbListModule
} from '@nebular/theme';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbUserModule,
    NbIconModule,
    NbButtonModule,
    NbTagModule,
    NbListModule
  ],
  template: `
    <div class="profile-container">
      <div class="header-banner"></div>
      
      <nb-card class="profile-card">
        <nb-card-body>
          <div class="user-info-section">
            <nb-user 
              [name]="user?.prenom + ' ' + user?.nom" 
              [title]="user?.login" 
              size="giant"
              class="profile-user">
            </nb-user>
            
            <div class="details">
              <h2>{{ user?.prenom }} {{ user?.nom }}</h2>
              <p class="email"><nb-icon icon="email-outline"></nb-icon> {{ user?.email }}</p>
              <div class="profiles-list">
                <nb-tag-list>
                  <nb-tag *ngFor="let p of user?.profils" [text]="p" status="primary" size="small"></nb-tag>
                </nb-tag-list>
              </div>
            </div>
            
            <div class="actions">
              <button nbButton status="primary" outline size="small">
                <nb-icon icon="edit-2-outline"></nb-icon> Éditer le profil
              </button>
            </div>
          </div>
        </nb-card-body>
      </nb-card>

      <div class="row">
        <div class="col-md-6">
          <nb-card>
            <nb-card-header>Informations Personnelles</nb-card-header>
            <nb-list>
              <nb-list-item>
                <strong>Identifiant:</strong> {{ user?.login }}
              </nb-list-item>
              <nb-list-item>
                <strong>Prénom:</strong> {{ user?.prenom }}
              </nb-list-item>
              <nb-list-item>
                <strong>Nom:</strong> {{ user?.nom }}
              </nb-list-item>
              <nb-list-item>
                <strong>Email:</strong> {{ user?.email || 'N/A' }}
              </nb-list-item>
            </nb-list>
          </nb-card>
        </div>
        <div class="col-md-6">
          <nb-card>
            <nb-card-header>Sécurité & Rôles</nb-card-header>
            <nb-list>
              <nb-list-item>
                <strong>Rôles Actifs:</strong>
                <div class="badge-container">
                    <span class="badge" *ngFor="let role of user?.profils">{{ role }}</span>
                </div>
              </nb-list-item>
              <nb-list-item>
                <strong>Dernière Connexion:</strong> Aujourd'hui
              </nb-list-item>
              <nb-list-item>
                <button nbButton ghost status="info">Changer le mot de passe</button>
              </nb-list-item>
            </nb-list>
          </nb-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .user-info-section {
      display: flex;
      align-items: center;
      padding: 1rem;
      gap: 2rem;
    }
    .profile-user {
      border: 5px solid white;
      border-radius: 50%;
      background: white;
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
  `]
})
export class UserProfileComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

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
