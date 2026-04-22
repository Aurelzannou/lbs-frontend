import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbButtonModule, 
  NbInputModule, 
  NbSelectModule, 
  NbFormFieldModule, 
  NbIconModule,
  NbSpinnerModule,
  NbToggleModule,
  NbDialogRef,
  NbCardModule
} from '@nebular/theme';
import { DossierEleveService } from '../../../../core/services/dossier-eleve.service';
import { EleveService } from '../../../../core/services/eleve.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DossierEleve } from '../../../../core/models/dossier-eleve.model';
import { Eleve } from '../../../../core/models/eleve.model';
import { Classe } from '../../../../core/models/classe.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';

@Component({
  selector: 'app-dossier-eleve-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule,
    NbToggleModule,
    NbCardModule
  ],
  templateUrl: './dossier-eleve-form-dialog.component.html',
  styleUrl: './dossier-eleve-form-dialog.component.scss'
})
export class DossierEleveFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dossierService = inject(DossierEleveService);
  private eleveService = inject(EleveService);
  private classeService = inject(ClasseService);
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  isEdit = false;

  eleves: Eleve[] = [];
  classes: Classe[] = [];
  annees: AnneeScolaire[] = [];

  data: DossierEleve = null as any;

  constructor(
    public dialogRef: NbDialogRef<DossierEleveFormDialogComponent>
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      eleveId: [this.data?.eleveId || this.data?.eleve?.id || null, [Validators.required]],
      classeId: [this.data?.classeId || this.data?.classe?.id || null, [Validators.required]],
      anneeScolaireId: [this.data?.anneeScolaireId || this.data?.anneeScolaire?.id || null, [Validators.required]],
    });
  }

  private loadData(): void {
    this.eleveService.getAll(1, 100).subscribe(res => this.eleves = res.data || res);
    this.classeService.getAll(1, 100).subscribe(res => this.classes = res.data || res);
    this.anneeService.getAll(1, 100).subscribe(res => this.annees = res.data || res);
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const confirmed = await this.notification.confirm(
        this.isEdit ? 'Voulez-vous modifier ce dossier ?' : 'Voulez-vous créer ce dossier d\'inscription ?'
      );
      
      if (!confirmed) return;

      this.loading = true;
      const obs = this.isEdit 
        ? this.dossierService.update(this.data.uuid!, this.form.value)
        : this.dossierService.create(this.form.value);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Dossier modifié' : 'Dossier créé');
          this.dialogRef.close(true);
        },
        error: () => {
          this.notification.error('Une erreur est survenue');
          this.loading = false;
        }
      });
    }
  }
}
