import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Tableau de Bord</h1>
        <p>Aperçu global de l'établissement</p>
      </header>
      
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
              <mat-icon>record_voice_over</mat-icon>
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
              <mat-icon>assignment_turned_in</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Inscriptions</span>
              <span class="stat-value">85%</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon payments-bg">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-label">Recouvrement</span>
              <span class="stat-value">€ 42k</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div class="recent-activity">
        <h2>Sessions de cours en cours</h2>
        <mat-card class="activity-table-card">
          <mat-card-content>
            <p style="padding: 20px; color: #666; text-align: center;">
              Affichage des données en temps réel (Simulation)
            </p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 32px;
    }
    
    .page-header h1 {
      font-size: 2.2rem;
      margin-bottom: 4px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 6px rgba(0,0,0,0.03);
    }
    
    mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
    }
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stat-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .students-bg { background: linear-gradient(135deg, #1352e2 0%, #4676e9 100%); }
    .teachers-bg { background: linear-gradient(135deg, #ff4081 0%, #ff6e9d 100%); }
    .enrol-bg { background: linear-gradient(135deg, #4caf50 0%, #81c784 100%); }
    .payments-bg { background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      color: #777;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 1.6rem;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
    }
    
    .recent-activity h2 {
      margin-bottom: 20px;
      font-size: 1.4rem;
    }
    
    .activity-table-card {
      border-radius: 12px;
      border: none;
    }
  `
})
export class DashboardComponent {}
