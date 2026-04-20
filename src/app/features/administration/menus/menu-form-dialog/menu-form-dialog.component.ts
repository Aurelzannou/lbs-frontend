import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbButtonModule, 
  NbInputModule, 
  NbIconModule, 
  NbCardModule,
  NbFormFieldModule,
  NbSpinnerModule,
  NbSelectModule,
  NbCheckboxModule
} from '@nebular/theme';
import { MenuService, MenuResponse } from '../../../../core/services/menu.service';
import { Profil, ProfilService } from '../../../../core/services/profil.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-menu-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule,
    NbInputModule,
    NbIconModule,
    NbCardModule,
    NbFormFieldModule,
    NbSpinnerModule,
    NbSelectModule,
    NbCheckboxModule
  ],
  template: `
    <nb-card [nbSpinner]="loading" nbSpinnerStatus="primary">
      <nb-card-header>
        <nb-icon [icon]="isEdit ? 'edit-2-outline' : 'plus-circle-outline'" style="margin-right:8px"></nb-icon>
        {{ isEdit ? 'Modifier le Menu' : 'Nouveau Menu' }}
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="row">
            <div class="col-6 mb-3">
              <label for="titre" class="label required">Titre</label>
              <input nbInput fullWidth id="titre" formControlName="titre" placeholder="Ex: Tableau de bord">
            </div>
            <div class="col-6 mb-3">
              <label for="code" class="label required">Code (unique)</label>
              <input nbInput fullWidth id="code" formControlName="code" placeholder="Ex: DASHBOARD" style="text-transform:uppercase">
            </div>
          </div>

          <div class="mb-3">
            <label for="path" class="label">Chemin (Path)</label>
            <input nbInput fullWidth id="path" formControlName="path" placeholder="Ex: /referentiel/niveaux (vide si groupe parent)">
            <p class="hint">Laissez vide si ce menu est un groupe contenant des sous-menus.</p>
          </div>

          <div class="row">
            <div class="col-6 mb-3">
              <label for="ordre" class="label required">Ordre d'affichage</label>
              <input nbInput fullWidth type="number" id="ordre" formControlName="ordre" min="1">
            </div>
            <div class="col-6 mb-3">
              <label class="label">Menu parent <span class="optional">(optionnel)</span></label>
              <nb-select fullWidth formControlName="menuEnfantId" placeholder="Aucun (menu racine)">
                <nb-option [value]="null">— Aucun (menu racine) —</nb-option>
                <nb-option *ngFor="let m of parentMenus" [value]="m.id">
                  {{ m.titre }} ({{ m.code }})
                </nb-option>
              </nb-select>
            </div>
          </div>

          <div class="mb-3">
            <label class="label">Profils autorisés</label>
            <div class="profils-list mt-2">
              <nb-checkbox *ngFor="let p of allProfils" 
                           [checked]="isProfilSelected(p.id)"
                           (checkedChange)="toggleProfil(p.id, $event)">
                {{ p.libelle }} ({{ p.code }})
              </nb-checkbox>
            </div>
            <p class="hint" *ngIf="allProfils.length === 0">Aucun profil disponible</p>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button nbButton ghost type="button" (click)="onCancel()">Annuler</button>
            <button nbButton status="primary" type="submit" [disabled]="form.invalid || loading">
              <nb-icon [icon]="isEdit ? 'checkmark-outline' : 'plus-outline'"></nb-icon>
              {{ isEdit ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    nb-card {
      margin: 0;
      min-width: 560px;
    }
    .label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
      font-size: 0.8rem;
      color: #8f9bb3;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .label.required::after {
      content: ' *';
      color: #ff3d71;
    }
    .optional {
      font-weight: 400;
      color: #c5cee0;
      text-transform: none;
      font-size: 0.75rem;
    }
    .hint {
      font-size: 0.75rem;
      color: #8f9bb3;
      margin-top: 4px;
      margin-bottom: 0;
    }
    .profils-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      max-height: 150px;
      overflow-y: auto;
      padding: 12px;
      border: 1px solid #edf1f7;
      border-radius: 4px;
      background: #f7f9fc;
    }
    .row {
      display: flex;
      gap: 1rem;
    }
    .col-6 {
      flex: 1;
    }
    .mb-3 {
      margin-bottom: 1rem;
    }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .gap-2 { gap: 0.5rem; }
    .d-flex { display: flex; }
    .justify-content-end { justify-content: flex-end; }
  `]
})
export class MenuFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private menuService = inject(MenuService);
  private profilService = inject(ProfilService);
  private toastr = inject(NbToastrService);

  form!: FormGroup;
  isEdit = false;
  loading = false;
  allProfils: Profil[] = [];
  selectedProfilIds: number[] = [];
  parentMenus: MenuResponse[] = []; // menus racines disponibles comme parents

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
      menuEnfantId: [this.data?.menuEnfantId || null]
    });

    this.loadProfils();
    this.loadParentMenus();
  }

  loadProfils(): void {
    this.profilService.getAll().subscribe({
      next: (response: any) => {
        // ApiService return already response.data -> { data: [], meta: {} }
        this.allProfils = response.data || [];
      }
    });
  }

  loadParentMenus(): void {
    this.menuService.getAll().subscribe({
      next: (menus: MenuResponse[]) => {
        // N'afficher que les menus racines (sans parent) comme candidats parents
        this.parentMenus = menus.filter(m => m.menuEnfantId == null);
      }
    });
  }

  isProfilSelected(id: number): boolean {
    return this.selectedProfilIds.includes(id);
  }

  toggleProfil(id: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedProfilIds.includes(id)) this.selectedProfilIds.push(id);
    } else {
      this.selectedProfilIds = this.selectedProfilIds.filter(pid => pid !== id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const formVal = this.form.value;
    const request = {
      titre: formVal.titre,
      code: formVal.code.toUpperCase(),
      path: formVal.path || null,
      ordre: formVal.ordre,
      menuEnfantId: formVal.menuEnfantId || null,
      profilIds: this.selectedProfilIds
    };

    const obs$ = this.isEdit
      ? this.menuService.update(this.data.id, request)
      : this.menuService.create(request);

    obs$.subscribe({
      next: () => {
        this.toastr.success(this.isEdit ? 'Menu mis à jour' : 'Menu créé avec succès', 'Succès');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.toastr.danger('Erreur lors de la sauvegarde du menu', 'Erreur');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
