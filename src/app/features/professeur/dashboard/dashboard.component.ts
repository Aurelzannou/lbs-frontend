import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from '../../../core/services/auth.service';
import { AnneeScolaireService } from '../../../core/services/annee-scolaire.service';
import { NoteService } from '../../../core/services/note.service';
import { ClasseMatiereANoter } from '../../../core/models/note.model';

@Component({
  selector: 'app-professeur-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ProfesseurDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private keycloakService = inject(KeycloakService);
  private anneeService = inject(AnneeScolaireService);
  private noteService = inject(NoteService);
  private router = inject(Router);

  userName = 'Professeur';
  userInitial = 'P';
  classes: ClasseMatiereANoter[] = [];
  loading = false;

  async ngOnInit(): Promise<void> {
    try {
      if (await this.keycloakService.isLoggedIn()) {
        const profile = await this.keycloakService.loadUserProfile();
        this.userName = profile.firstName || 'Professeur';
        this.userInitial = this.userName.charAt(0).toUpperCase();
      }
    } catch {
      // Keycloak non initialisé au démarrage — on continue quand même
    }

    this.loading = true;
    this.anneeService.getAnneeCourante().subscribe({
      next: (res: any) => {
        const annee = res?.data ?? res;
        if (annee?.id) {
          this.noteService.getMesClasses(annee.id).subscribe({
            next: (r: any) => {
              this.classes = r.data ?? (Array.isArray(r) ? r : []);
              this.loading = false;
            },
            error: () => (this.loading = false)
          });
        } else {
          this.loading = false;
        }
      },
      error: () => (this.loading = false)
    });
  }

  ouvrirSaisie(item: ClasseMatiereANoter): void {
    this.router.navigate(['/professeur/saisie'], {
      queryParams: { classeId: item.classeId, matiereId: item.matiereId }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
