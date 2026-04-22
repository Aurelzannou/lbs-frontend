import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="banner-content">
          <h1>Tableau de Bord</h1>
          <p>Bienvenue dans votre interface de gestion scolaire. Voici l'état actuel de votre établissement.</p>
        </div>
        <div class="banner-image"></div>
      </div>
      
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon students-bg">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Élèves</span>
              <span class="stat-value">1,248</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon teachers-bg">
              <mat-icon>school</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Professeurs</span>
              <span class="stat-value">72</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon enrol-bg">
              <mat-icon>fact_check</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Classes</span>
              <span class="stat-value">34</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon payments-bg">
              <mat-icon>account_balance</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Trésorerie</span>
              <span class="stat-value">€ 42.5k</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div class="main-sections">
        <div class="activity-section">
          <header class="section-header">
            <h2>Cours en temps réel</h2>
            <button mat-button color="primary">Tout voir</button>
          </header>
          <mat-card class="glass-card">
            <mat-card-content>
              <div class="empty-state">
                <mat-icon>event_note</mat-icon>
                <p>Aucune session de cours active pour le moment.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="quick-actions">
          <header class="section-header">
            <h2>Actions Rapides</h2>
          </header>
          <div class="actions-grid">
            <button mat-flat-button class="action-btn yellow-btn" routerLink="/scolarite/inscriptions">
              <mat-icon>person_add</mat-icon> Inscrire un élève
            </button>
            <button mat-flat-button class="action-btn outline-btn">
              <mat-icon>receipt_long</mat-icon> Émettre un reçu
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
      animation: fadeIn 0.8s ease-out;
    }

    .welcome-banner {
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
      border-radius: 2rem;
      padding: 3rem;
      margin-bottom: 2.5rem;
      color: #451a03;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(245, 158, 11, 0.4);

      &::after {
        content: '';
        position: absolute;
        top: -10%;
        right: -5%;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        z-index: 0;
      }

      .banner-content {
        position: relative;
        z-index: 1;
        max-width: 600px;

        h1 {
          font-size: 3rem;
          font-weight: 900;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }

        p {
          font-size: 1.15rem;
          font-weight: 600;
          opacity: 0.9;
          margin: 0;
          line-height: 1.6;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      border-radius: 1.5rem;
      border: 2px solid #fef3c7;
      background: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 30px -10px rgba(245, 158, 11, 0.2);
        border-color: #fbbf24;
      }
    }

    mat-card-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.75rem !important;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1);

      mat-icon {
        color: white;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .students-bg { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
    .teachers-bg { background: linear-gradient(135deg, #78350f 0%, #451a03 100%); }
    .enrol-bg { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); }
    .payments-bg { background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%); mat-icon { color: #92400e; } }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .stat-label {
        color: #92400e;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 1.8rem;
        font-weight: 800;
        color: #451a03;
      }
    }

    .main-sections {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      
      h2 {
        font-size: 1.5rem;
        font-weight: 800;
        color: #451a03;
        margin: 0;
      }
    }

    .glass-card {
      border-radius: 1.5rem;
      border: 2px dashed #fef3c7;
      background: rgba(255, 255, 255, 0.5);
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #d97706;
      opacity: 0.6;

      mat-icon { font-size: 48px; width: 48px; height: 48px; }
      p { font-weight: 600; margin: 0; }
    }

    .actions-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-btn {
      height: 3.5rem;
      border-radius: 1rem;
      font-weight: 800;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      
      mat-icon { margin-right: 0.5rem; }

      &.yellow-btn {
        background: #fbbf24;
        color: #451a03;
        &:hover { background: #f59e0b; }
      }

      &.outline-btn {
        border: 2px solid #fbbf24;
        color: #92400e;
        &:hover { background: #fef3c7; }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      .main-sections { grid-template-columns: 1fr; }
      .welcome-banner { padding: 2rem; h1 { font-size: 2rem; } }
    }
  `
})
export class DashboardComponent {}
