import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="welcome-container">
      <header class="hero">
        <h1>Bienvenue à l'Application LBS</h1>
        <p>Votre plateforme de gestion scolaire moderne, sécurisée et intuitive.</p>
        <button mat-raised-button color="primary" class="cta-button">
          Commencer
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </header>
      
      <div class="features-grid">
        <mat-card class="feature-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">school</mat-icon>
            <mat-card-title>Gestion des Élèves</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Suivez les inscriptions, les parcours et les dossiers académiques en toute simplicité.</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="feature-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="accent">security</mat-icon>
            <mat-card-title>Sécurité Avancée</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Une authentification robuste via Keycloak protège toutes vos données sensibles.</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="feature-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">cloud_upload</mat-icon>
            <mat-card-title>Stockage Cloud</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Intégration Minio pour une gestion efficace et sécurisée de vos documents.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .welcome-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .hero {
      text-align: center;
      margin-bottom: 60px;
      animation: fadeInDown 0.8s ease-out;
    }
    
    .hero h1 {
      font-size: 3.5rem;
      margin-bottom: 16px;
      background: linear-gradient(45deg, #1352e2, #ff4081);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .hero p {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 32px;
    }
    
    .cta-button {
      padding: 0 32px;
      height: 48px;
      border-radius: 24px;
      font-weight: 600;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }
    
    .feature-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 8px 16px rgba(0,0,0,0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      background: white;
    }
    
    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    }
    
    mat-card-header {
      margin-bottom: 16px;
    }
    
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class HomeComponent {}
