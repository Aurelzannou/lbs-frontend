import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { PresenceService } from '../../../../core/services/presence.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SeanceJour } from '../../../../core/models/presence.model';
import { Classe } from '../../../../core/models/classe.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { PresenceFeuilleDialogComponent } from '../presence-feuille-dialog/presence-feuille-dialog.component';

@Component({
  selector: 'app-presence-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, NgSelectModule],
  templateUrl: './presence-list.component.html',
  styleUrl: './presence-list.component.scss'
})
export class PresenceListComponent implements OnInit {
  private presenceService = inject(PresenceService);
  private classeService = inject(ClasseService);
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  classes: Classe[] = [];
  annees: AnneeScolaire[] = [];
  classeId: number | null = null;
  anneeScolaireId: number | null = null;
  date: string = new Date().toISOString().substring(0, 10);
  seances: SeanceJour[] = [];
  loading = false;

  ngOnInit(): void {
    this.classeService.getAll(1, 100).subscribe((res: any) => {
      this.classes = res.data ?? (Array.isArray(res) ? res : []);
    });

    this.anneeService.getAll(0, 50).subscribe((res: any) => {
      const page = res.data ?? res;
      this.annees = page.data ?? (Array.isArray(page) ? page : []);
      const active = this.annees.find((a) => a.actif);
      this.anneeScolaireId = active?.id ?? this.annees[0]?.id ?? null;
      this.refresh();
    });
  }

  onClasseChange(): void {
    this.refresh();
  }

  onAnneeChange(): void {
    this.refresh();
  }

  onDateChange(): void {
    this.refresh();
  }

  refresh(): void {
    if (!this.classeId || !this.anneeScolaireId || !this.date) {
      this.seances = [];
      return;
    }
    this.loading = true;
    this.presenceService.getJour(this.classeId, this.anneeScolaireId, this.date).subscribe({
      next: (res: any) => {
        this.seances = res.data ?? (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.notification.error('Impossible de charger les cours de ce jour');
        this.loading = false;
      }
    });
  }

  prendrePresence(seance: SeanceJour): void {
    this.dialog
      .open(PresenceFeuilleDialogComponent, {
        width: '640px',
        data: { emploiTempsId: seance.emploiTempsId, date: this.date, seance },
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.refresh();
      });
  }
}
