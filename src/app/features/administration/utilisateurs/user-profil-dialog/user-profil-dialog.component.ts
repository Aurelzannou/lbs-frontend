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
import { NotificationService } from '../../../../core/services/notification.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../core/services/user.service';
import { ProfilService, Profil } from '../../../../core/services/profil.service';

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
    NbCheckboxModule,
    NgSelectModule,
    FormsModule
  ],
  template: `
    <nb-card [nbSpinner]="loading" nbSpinnerStatus="primary">
      <nb-card-header>
        Assigner des Profils à {{ data.prenom }} {{ data.nom }}
      </nb-card-header>
      <nb-card-body>
        <p class="mb-3 text-hint">Sélectionnez les profils applicables à cet utilisateur :</p>
        
        <div class="mb-4">
          <label class="label">Profils</label>
          <ng-select [items]="allProfils"
                     [(ngModel)]="selectedProfilCodes"
                     [multiple]="true"
                     bindLabel="libelle"
                     bindValue="code"
                     placeholder="Sélectionnez les profils"
                     [searchable]="true"
                     class="custom-ng-select">
            <ng-template ng-option-tmp let-item="item">
              {{ item.libelle }} <small class="text-hint">({{ item.code }})</small>
            </ng-template>
          </ng-select>
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
  `]
})
export class UserProfilDialogComponent implements OnInit {
  private userService = inject(UserService);
  private profilService = inject(ProfilService);
  private notification = inject(NotificationService);

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
        this.allProfils = response.data || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.notification.error('Erreur chargement profils');
        this.loading = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    const confirmed = await this.notification.confirm(
      'Voulez-vous vraiment modifier les profils de cet utilisateur ?',
      'Confirmation d\'assignation'
    );

    if (!confirmed) return;

    this.loading = true;
    this.userService.updateProfils(this.data.id, this.selectedProfilCodes).subscribe({
      next: () => {
        this.notification.success('Profils mis à jour avec succès');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.notification.error('Erreur lors de la mise à jour des profils');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
