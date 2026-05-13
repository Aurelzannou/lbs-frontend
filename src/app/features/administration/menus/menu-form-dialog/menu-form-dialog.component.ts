import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuService, MenuResponse } from '../../../../core/services/menu.service';
import { ProfilService, Profil } from '../../../../core/services/profil.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-menu-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule, MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    NgSelectModule
  ],
  templateUrl: './menu-form-dialog.component.html',
  styleUrls: ['./menu-form-dialog.component.scss']
})
export class MenuFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private menuService = inject(MenuService);
  private profilService = inject(ProfilService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  isEdit = false;
  loading = false;
  allProfils: Profil[] = [];
  parentMenus: MenuResponse[] = [];

  constructor(
    public dialogRef: MatDialogRef<MenuFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuResponse
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      titre: [this.data?.titre || '', Validators.required],
      code: [this.data?.code || '', Validators.required],
      path: [this.data?.path || ''],
      ordre: [this.data?.ordre || 1, [Validators.required, Validators.min(1)]],
      menuEnfantId: [this.data?.menuEnfantId || null],
      profilIds: [[]]
    });

    this.loadProfils();
    this.loadParentMenus();

    if (this.isEdit && this.data.profils) {
      const ids = this.data.profils.map((p: any) => p.id || p);
      this.form.patchValue({ profilIds: ids });
    }
  }

  loadProfils(): void {
    this.profilService.getAll(1, 100).subscribe({
      next: (response: any) => {
        this.allProfils = response.data || [];
      }
    });
  }

  loadParentMenus(): void {
    this.menuService.getAll(1, 100).subscribe({
      next: (response: any) => {
        const items = response.data?.data || [];
        this.parentMenus = items.filter((m: any) => m.menuEnfantId == null);
      },
      error: (err) => console.error('Erreur chargement menus parents:', err)
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous vraiment modifier ce menu ?' : 'Voulez-vous vraiment créer ce menu ?',
      'Confirmation'
    );
    if (!confirmed) return;

    this.loading = true;
    const formVal = this.form.value;
    const request = {
      ...formVal,
      code: formVal.code.toUpperCase(),
      path: formVal.path || null,
      menuEnfantId: formVal.menuEnfantId || null
    };

    const obs$ = this.isEdit
      ? this.menuService.update(this.data.id, request)
      : this.menuService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Menu mis à jour' : 'Menu créé avec succès');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.notification.error('Erreur lors de la sauvegarde du menu');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
