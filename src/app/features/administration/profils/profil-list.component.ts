import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbIconModule, 
  NbTableModule,
  NbDialogService,
  NbToastrService,
  NbTooltipModule
} from '@nebular/theme';
import { Profil, ProfilService } from '../../../core/services/profil.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProfilFormDialogComponent } from './profil-form-dialog/profil-form-dialog.component';

@Component({
  selector: 'app-profil-list',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    MatDialogModule
  ],
  template: `
    <nb-card>
      <nb-card-header class="header-container">
        <div class="title-section">
          <h2>Gestion des Profils</h2>
          <p class="subtitle">Administrez les rôles et permissions des utilisateurs</p>
        </div>
        <button nbButton status="primary" (click)="addProfil()">
          <nb-icon icon="plus-outline"></nb-icon> NOUVEAU PROFIL
        </button>
      </nb-card-header>
      
      <nb-card-body>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>UUID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let profil of profils">
                <td><span class="code-badge">{{ profil.code }}</span></td>
                <td>{{ profil.libelle }}</td>
                <td><small class="text-hint">{{ profil.uuid }}</small></td>
                <td>
                  <div class="action-buttons">
                    <button nbButton ghost status="info" size="small" (click)="editProfil(profil)" nbTooltip="Modifier">
                      <nb-icon icon="edit-2-outline"></nb-icon>
                    </button>
                    <button nbButton ghost status="danger" size="small" (click)="deleteProfil(profil)" nbTooltip="Supprimer">
                      <nb-icon icon="trash-2-outline"></nb-icon>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="profils.length === 0">
                <td colspan="4" class="no-data">Aucun profil trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title-section h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    .subtitle {
      margin: 0;
      color: #8f9bb3;
      font-size: 0.9rem;
    }
    .table-container {
      margin-top: 1rem;
      overflow-x: auto;
    }
    .custom-table {
      width: 100%;
      border-collapse: collapse;
    }
    .custom-table th {
      text-align: left;
      padding: 1rem;
      background: #f7f9fc;
      color: #222b45;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05rem;
    }
    .custom-table td {
      padding: 1rem;
      border-bottom: 1px solid #edf1f7;
    }
    .code-badge {
      background: #e4e9f2;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.8rem;
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .no-data {
      text-align: center;
      padding: 3rem !important;
      color: #8f9bb3;
      font-style: italic;
    }
  `]
})
export class ProfilListComponent implements OnInit {
  profils: Profil[] = [];

  constructor(
    private profilService: ProfilService,
    private toastrService: NbToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProfils();
  }

  loadProfils(): void {
    this.profilService.getAll().subscribe({
      next: (data) => this.profils = data,
      error: (err) => {
        console.error('Erreur chargement profils:', err);
        this.toastrService.danger('Impossible de charger les profils', 'Erreur');
      }
    });
  }

  addProfil(): void {
    this.dialog.open(ProfilFormDialogComponent, {
      width: '450px'
    }).afterClosed().subscribe(result => {
      if (result) this.loadProfils();
    });
  }

  editProfil(profil: Profil): void {
    this.dialog.open(ProfilFormDialogComponent, {
      width: '450px',
      data: profil
    }).afterClosed().subscribe(result => {
      if (result) this.loadProfils();
    });
  }

  deleteProfil(profil: Profil): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le profil ${profil.code} ?`)) {
      this.profilService.delete(profil.id).subscribe({
        next: () => {
          this.toastrService.success(`Profil ${profil.code} supprimé`, 'Succès');
          this.loadProfils();
        },
        error: (err) => {
          this.toastrService.danger('Erreur lors de la suppression', 'Erreur');
        }
      });
    }
  }
}
