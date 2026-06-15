import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HistoriqueDialogComponent } from '../../shared/historique-dialog/historique-dialog.component';

@Component({
  selector: 'app-confirmation-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTooltipModule],
  templateUrl: './confirmation-list.component.html',
  styleUrl: './confirmation-list.component.scss'
})
export class ConfirmationListComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private notification        = inject(NotificationService);
  private dialog              = inject(MatDialog);
  private cdr                 = inject(ChangeDetectorRef);

  dossiers: any[] = [];
  loading = false;
  activeTab = 'ACCEPTE';

  readonly tabs = [
    { code: 'ACCEPTE', label: 'Acceptés'  },
    { code: 'INSCRIT', label: 'Inscrits'  },
  ];

  ngOnInit(): void { this.refresh(); }

  selectTab(code: string): void {
    this.activeTab = code;
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.confirmationService.getDossiers(this.activeTab).subscribe({
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

  canInscrire(d: any): boolean { return d.statutCode === 'ACCEPTE'; }

  async inscrire(d: any): Promise<void> {
    const ok = await this.notification.confirm(
      `Confirmer l'inscription de ${d.eleveNom} ${d.elevePrenom} — dossier ${d.numero} ?`
    );
    if (!ok) return;
    this.confirmationService.inscrire(d.uuid).subscribe({
      next: () => { this.notification.success('Inscription confirmée'); this.refresh(); },
      error: () => this.notification.error("Erreur lors de la confirmation d'inscription")
    });
  }

  voirHistorique(d: any): void {
    this.dialog.open(HistoriqueDialogComponent, {
      width: '560px',
      data: { uuid: d.uuid, numero: d.numero }
    });
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      ACCEPTE: 'st-accepte', INSCRIT: 'st-inscrit',
      DEPOSE: 'st-depose', REFUSE: 'st-refuse'
    };
    return map[code] || 'st-default';
  }
}
