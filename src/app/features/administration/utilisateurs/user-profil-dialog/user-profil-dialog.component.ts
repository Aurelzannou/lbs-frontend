import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbButtonModule, 
  NbIconModule, 
  NbCardModule,
  NbSpinnerModule,
  NbCheckboxModule
} from '@nebular/theme';
import { UserService, User } from '../../../../core/services/user.service';
import { Profil, ProfilService } from '../../../../core/services/profil.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-user-profil-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbSpinnerModule,
    NbCheckboxModule
  ],
  template: `
    <nb-card [nbSpinner]="loading" nbSpinnerStatus="primary">
      <nb-card-header>
        Assigner des Profils à {{ data.prenom }} {{ data.nom }}
      </nb-card-header>
      <nb-card-body>
        <p class="mb-3 text-hint">Sélectionnez les profils applicables à cet utilisateur :</p>
        
        <div class="profils-list">
          <nb-checkbox *ngFor="let p of allProfils" 
                       [checked]="isProfilSelected(p.code)"
                       (checkedChange)="toggleProfil(p.code, $event)">
            {{ p.libelle }} ({{ p.code }})
          </nb-checkbox>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button nbButton ghost type="button" (click)="onCancel()">Annuler</button>
          <button nbButton status="primary" type="button" (click)="onSubmit()" [disabled]="loading">
            Enregistrer les modifications
          </button>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    nb-card {
      margin: 0;
      min-width: 450px;
    }
    .profils-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 15px;
      background: #f7f9fc;
      border-radius: 4px;
    }
  `]
})
export class UserProfilDialogComponent implements OnInit {
  private userService = inject(UserService);
  private profilService = inject(ProfilService);
  private toastr = inject(NbToastrService);

  loading = false;
  allProfils: Profil[] = [];
  selectedProfilCodes: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<UserProfilDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  ngOnInit(): void {
    this.loadProfils();
    if (this.data.profils) {
      this.selectedProfilCodes = [...this.data.profils];
    }
  }

  loadProfils(): void {
    this.loading = true;
    this.profilService.getAll().subscribe({
      next: (response: any) => {
        // ApiService return already response.data -> { data: [], meta: {} }
        this.allProfils = response.data || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.toastr.danger('Erreur chargement profils', 'Erreur');
        this.loading = false;
      }
    });
  }

  isProfilSelected(code: string): boolean {
    return this.selectedProfilCodes.includes(code);
  }

  toggleProfil(code: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedProfilCodes.includes(code)) this.selectedProfilCodes.push(code);
    } else {
      this.selectedProfilCodes = this.selectedProfilCodes.filter(c => c !== code);
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.userService.updateProfils(this.data.id, this.selectedProfilCodes).subscribe({
      next: () => {
        this.toastr.success('Profils mis à jour avec succès', 'Succès');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.toastr.danger('Erreur lors de la mise à jour des profils', 'Erreur');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
