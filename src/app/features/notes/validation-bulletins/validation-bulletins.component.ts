import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { ValidationBulletinService } from '../../../core/services/validation-bulletin.service';
import { BulletinService } from '../../../core/services/bulletin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';
import { ValidationBulletin } from '../../../core/models/validation-bulletin.model';

@Component({
  selector: 'app-validation-bulletins',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, NgSelectModule],
  templateUrl: './validation-bulletins.component.html',
  styleUrl: './validation-bulletins.component.scss'
})
export class ValidationBulletinsComponent implements OnInit {
  private periodeService = inject(PeriodeAcademiqueService);
  private validationBulletinService = inject(ValidationBulletinService);
  private bulletinService = inject(BulletinService);
  private notification = inject(NotificationService);

  periodes: PeriodeAcademique[] = [];
  periodeId: number | null = null;
  liste: ValidationBulletin[] = [];
  loading = false;
  telechargementEnCours: number | null = null;

  ngOnInit(): void {
    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      this.periodes = res.data ?? (Array.isArray(res) ? res : []);
    });
  }

  get periodeSelectionnee(): PeriodeAcademique | undefined {
    return this.periodes.find((p) => p.id === this.periodeId);
  }

  onPeriodeChange(): void {
    this.refresh();
  }

  refresh(): void {
    const periode = this.periodeSelectionnee;
    if (!periode || !periode.anneeScolaireId) {
      this.liste = [];
      return;
    }
    this.loading = true;
    this.validationBulletinService.list(periode.id!, periode.anneeScolaireId).subscribe({
      next: (res: any) => {
        this.liste = res.data ?? (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.notification.error('Impossible de charger les statuts de validation');
        this.loading = false;
      }
    });
  }

  async valider(item: ValidationBulletin): Promise<void> {
    const periode = this.periodeSelectionnee;
    if (!periode?.anneeScolaireId) return;

    const confirmed = await this.notification.confirm(
      `Valider les bulletins de ${item.classeLibelle} pour ${periode.libelle} ? ` +
        `Les notes de cette classe ne pourront plus être modifiées tant que la validation n'est pas annulée.`,
      'Valider les bulletins'
    );
    if (!confirmed) return;

    this.validationBulletinService.valider(item.classeId, item.periodeId, periode.anneeScolaireId).subscribe({
      next: () => {
        this.notification.success('Bulletins validés');
        this.refresh();
      },
      error: (err) => this.notification.error(err)
    });
  }

  async devalider(item: ValidationBulletin): Promise<void> {
    const confirmed = await this.notification.confirm(
      `Annuler la validation des bulletins de ${item.classeLibelle} ? La saisie des notes sera de nouveau possible.`,
      'Annuler la validation'
    );
    if (!confirmed) return;

    this.validationBulletinService.devalider(item.classeId, item.periodeId).subscribe({
      next: () => {
        this.notification.success('Validation annulée');
        this.refresh();
      },
      error: (err) => this.notification.error(err)
    });
  }

  telechargerPdf(item: ValidationBulletin): void {
    this.telechargementEnCours = item.classeId;
    this.bulletinService.telechargerPdfClasse(item.classeId, item.periodeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletins-${item.classeLibelle}-${item.periodeId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.telechargementEnCours = null;
      },
      error: () => {
        this.notification.error('Impossible de générer le PDF (vérifiez que des notes existent pour cette classe)');
        this.telechargementEnCours = null;
      }
    });
  }
}
