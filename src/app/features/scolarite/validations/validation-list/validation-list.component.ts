import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ValidationService } from '../../../../core/services/validation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RefusDialogComponent } from '../refus-dialog/refus-dialog.component';

@Component({
  selector: 'app-validation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './validation-list.component.html',
  styleUrl: './validation-list.component.scss'
})
export class ValidationListComponent implements OnInit {
  private validationService = inject(ValidationService);
  private notification      = inject(NotificationService);
  private dialog            = inject(MatDialog);
  private cdr               = inject(ChangeDetectorRef);

  dossiers: any[] = [];
  loading = false;
  activeStatut = 'ALL';

  readonly statuts = [
    { code: 'ALL',       label: 'Tous' },
    { code: 'DEPOSE',    label: 'Déposés' },
    { code: 'ACCEPTE',   label: 'Acceptés' },
    { code: 'REFUSE',    label: 'Refusés' },
    { code: 'INSCRIT',   label: 'Inscrits' },
  ];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    const statut = this.activeStatut === 'ALL' ? undefined : this.activeStatut;
    this.validationService.getAll(statut).subscribe({
      next: (res: any) => {
        this.dossiers = res.data ?? (Array.isArray(res) ? res : []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Impossible de charger les dossiers');
        this.loading = false;
      }
    });
  }

  filterByStatut(code: string): void {
    this.activeStatut = code;
    this.refresh();
  }

  countByStatut(code: string): number {
    if (code === 'ALL') return this.dossiers.length;
    return this.dossiers.filter(d => d.statutCode === code).length;
  }

  canAccepter(d: any): boolean { return d.statutCode === 'DEPOSE'; }
  canRefuser(d: any): boolean  { return ['DEPOSE', 'ACCEPTE'].includes(d.statutCode); }
  canInscrire(d: any): boolean { return d.statutCode === 'ACCEPTE'; }

  async accepter(d: any): Promise<void> {
    const ok = await this.notification.confirm(`Accepter le dossier ${d.numero} ?`);
    if (!ok) return;
    this.validationService.accepter(d.uuid).subscribe({
      next: () => { this.notification.success('Dossier accepté'); this.refresh(); },
      error: () => this.notification.error('Erreur lors de l\'acceptation')
    });
  }

  refuser(d: any): void {
    this.dialog.open(RefusDialogComponent, {
      width: '500px',
      data: { numero: d.numero }
    }).afterClosed().subscribe(motif => {
      if (motif === undefined) return;
      this.validationService.refuser(d.uuid, motif).subscribe({
        next: () => { this.notification.success('Dossier refusé'); this.refresh(); },
        error: () => this.notification.error('Erreur lors du refus')
      });
    });
  }

  async inscrire(d: any): Promise<void> {
    const ok = await this.notification.confirm(`Confirmer l'inscription pour le dossier ${d.numero} ?`);
    if (!ok) return;
    this.validationService.inscrire(d.uuid).subscribe({
      next: () => { this.notification.success('Élève inscrit avec succès'); this.refresh(); },
      error: () => this.notification.error('Erreur lors de l\'inscription')
    });
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      'DEPOSE':    'st-depose',
      'EN_ATTENTE':'st-attente',
      'ACCEPTE':   'st-accepte',
      'REFUSE':    'st-refuse',
      'INSCRIT':   'st-inscrit',
    };
    return map[code] || 'st-default';
  }
}
