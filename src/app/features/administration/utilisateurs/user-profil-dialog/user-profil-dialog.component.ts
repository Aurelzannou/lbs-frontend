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
  templateUrl: './user-profil-dialog.component.html',
  styleUrl: './user-profil-dialog.component.scss'
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
