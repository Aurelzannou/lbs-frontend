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
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Caisse } from '../../../../core/models/caisse.model';
import { MouvementCaisse } from '../../../../core/models/mouvement-caisse.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';

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
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);

  caisses: Caisse[] = [];
  caisseId: number | null = null;
  mouvements: MouvementCaisse[] = [];
  loading = false;
  displayedColumns = ['dateMouvement', 'typeMouvement', 'source', 'description', 'montant', 'soldeApres'];

  annees: (AnneeScolaire | { id: null; libelle: string })[] = [];
  /** Filtre par défaut sur l'année scolaire active — "Toutes les années" (id null) le lève. */
  anneeScolaireId: number | null = null;

  ngOnInit(): void {
    // Les deux appels sont indépendants (ordre de retour non garanti) — chacun relance le
    // chargement du journal une fois la caisse connue, ce qui couvre les deux ordres d'arrivée.
    this.caisseService.getAll(1, 100).subscribe((res) => {
      this.caisses = res.data || [];
      if (this.caisses.length === 1) {
        this.caisseId = this.caisses[0].id ?? null;
        this.onCaisseChange();
      }
    });
    this.anneeService.getAll(0, 50).subscribe((res: any) => {
      const page = res.data ?? res;
      const list: AnneeScolaire[] = page.data ?? (Array.isArray(page) ? page : []);
      this.annees = [{ id: null, libelle: 'Toutes les années' }, ...list];
      const active = list.find((a) => a.actif);
      this.anneeScolaireId = active?.id ?? null;
      if (this.caisseId) this.onCaisseChange();
    });
  }

  onAnneeChange(): void {
    this.onCaisseChange();
  }

  onCaisseChange(): void {
    this.mouvements = [];
    if (!this.caisseId) return;
    this.loading = true;
    this.mouvementCaisseService.listerParCaisse(this.caisseId, this.anneeScolaireId).subscribe({
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
