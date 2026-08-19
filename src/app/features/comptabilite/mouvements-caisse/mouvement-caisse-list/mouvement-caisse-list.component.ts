import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { CaisseService } from '../../../../core/services/caisse.service';
import { MouvementCaisseService } from '../../../../core/services/mouvement-caisse.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Caisse } from '../../../../core/models/caisse.model';
import { MouvementCaisse } from '../../../../core/models/mouvement-caisse.model';

@Component({
  selector: 'app-mouvement-caisse-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgSelectModule
  ],
  templateUrl: './mouvement-caisse-list.component.html',
  styleUrl: './mouvement-caisse-list.component.scss'
})
export class MouvementCaisseListComponent implements OnInit {
  private caisseService = inject(CaisseService);
  private mouvementCaisseService = inject(MouvementCaisseService);
  private notification = inject(NotificationService);

  caisses: Caisse[] = [];
  caisseId: number | null = null;
  mouvements: MouvementCaisse[] = [];
  loading = false;
  displayedColumns = ['dateMouvement', 'typeMouvement', 'source', 'description', 'montant', 'soldeApres'];

  ngOnInit(): void {
    this.caisseService.getAll(1, 100).subscribe((res) => {
      this.caisses = res.data || [];
      if (this.caisses.length === 1) {
        this.caisseId = this.caisses[0].id ?? null;
        this.onCaisseChange();
      }
    });
  }

  onCaisseChange(): void {
    this.mouvements = [];
    if (!this.caisseId) return;
    this.loading = true;
    this.mouvementCaisseService.listerParCaisse(this.caisseId).subscribe({
      next: (result) => {
        this.mouvements = result;
        this.loading = false;
      },
      error: () => {
        this.notification.error('Impossible de charger le journal de caisse');
        this.loading = false;
      }
    });
  }

  get soldeActuel(): number | null {
    const caisse = this.caisses.find((c) => c.id === this.caisseId);
    return caisse ? caisse.solde ?? 0 : null;
  }
}
