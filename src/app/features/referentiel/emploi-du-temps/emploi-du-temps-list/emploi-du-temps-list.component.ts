import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { EmploiDuTempsService } from '../../../../core/services/emploi-du-temps.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmploiDuTemps } from '../../../../core/models/emploi-du-temps.model';
import { Classe } from '../../../../core/models/classe.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { EmploiDuTempsFormDialogComponent } from '../emploi-du-temps-form-dialog/emploi-du-temps-form-dialog.component';

@Component({
  selector: 'app-emploi-du-temps-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    NgSelectModule,
    DragDropModule
  ],
  templateUrl: './emploi-du-temps-list.component.html',
  styleUrl: './emploi-du-temps-list.component.scss'
})
export class EmploiDuTempsListComponent implements OnInit {
  private emploiDuTempsService = inject(EmploiDuTempsService);
  private classeService = inject(ClasseService);
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  classes: Classe[] = [];
  annees: AnneeScolaire[] = [];
  classeId: number | null = null;
  anneeScolaireId: number | null = null;
  planning: EmploiDuTemps[] = [];
  loading = false;

  readonly jours = [
    { code: 'LUNDI', label: 'Lundi' },
    { code: 'MARDI', label: 'Mardi' },
    { code: 'MERCREDI', label: 'Mercredi' },
    { code: 'JEUDI', label: 'Jeudi' },
    { code: 'VENDREDI', label: 'Vendredi' },
    { code: 'SAMEDI', label: 'Samedi' }
  ];

  ngOnInit(): void {
    this.classeService.getAll(1, 100).subscribe((res: any) => {
      this.classes = res.data ?? (Array.isArray(res) ? res : []);
    });

    // L'année scolaire en cours doit toujours s'afficher en premier ; l'utilisateur
    // reste libre de basculer sur une année antérieure ensuite.
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

  refresh(): void {
    if (!this.classeId || !this.anneeScolaireId) {
      this.planning = [];
      return;
    }
    this.loading = true;
    this.emploiDuTempsService.getByClasse(this.classeId, this.anneeScolaireId).subscribe({
      next: (res: any) => {
        this.planning = res.data ?? (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.notification.error("Impossible de charger l'emploi du temps");
        this.loading = false;
      }
    });
  }

  seancesDuJour(jourCode: string): EmploiDuTemps[] {
    return this.planning.filter((s) => s.jour === jourCode);
  }

  get dropListIds(): string[] {
    return this.jours.map((j) => j.code);
  }

  /** Heure de reprise de la journée — les cours s'enchaînent à partir de là. */
  private readonly DEBUT_JOURNEE = '07:00';

  /**
   * Glisser-déposer une carte au-dessus/en dessous d'une autre (même jour) ou vers un
   * autre jour. Dans les deux cas, on réharmonise ensuite tout le jour concerné pour que
   * les cours s'enchaînent sans trou ni chevauchement, à partir de 7h, en conservant la
   * durée propre de chaque cours (souvent 2h, mais pas forcément).
   */
  onDrop(event: CdkDragDrop<EmploiDuTemps[]>): void {
    if (this.anneeVerrouillee) return;

    const seance = event.item.data as EmploiDuTemps;
    const nouveauJour = event.container.id;

    if (event.previousContainer === event.container) {
      const jourList = this.seancesDuJour(nouveauJour);
      moveItemInArray(jourList, event.previousIndex, event.currentIndex);
      this.harmoniserJour(nouveauJour, jourList);
      return;
    }

    seance.jour = nouveauJour;
    const jourDestination = this.seancesDuJour(nouveauJour).filter((s) => s !== seance);
    jourDestination.splice(event.currentIndex, 0, seance);
    this.harmoniserJour(nouveauJour, jourDestination);
  }

  /**
   * Recalcule séquentiellement heureDebut/heureFin de chaque cours de la liste (dans l'ordre
   * fourni) en partant de `DEBUT_JOURNEE`, en gardant la durée propre de chaque cours, puis
   * envoie le lot en une seule requête atomique (évite les faux conflits transitoires entre
   * cours du même jour qui échangent leurs créneaux).
   */
  private harmoniserJour(jour: string, jourList: EmploiDuTemps[]): void {
    let curseur = this.DEBUT_JOURNEE;
    const seances: { uuid: string; heureDebut: string; heureFin: string }[] = [];
    let changement = false;

    for (const s of jourList) {
      const duree = this.dureeEnMinutes(s.heureDebut, s.heureFin);
      const nouveauDebut = curseur;
      const nouveauFin = this.ajouterMinutes(curseur, duree);
      if (s.heureDebut !== nouveauDebut || s.heureFin !== nouveauFin) changement = true;
      s.heureDebut = nouveauDebut;
      s.heureFin = nouveauFin;
      seances.push({ uuid: s.uuid!, heureDebut: nouveauDebut, heureFin: nouveauFin });
      curseur = nouveauFin;
    }

    if (!changement) return;

    this.emploiDuTempsService.reorganiserJour(jour, seances).subscribe({
      next: () => {
        this.notification.success('Emploi du temps réorganisé');
        this.refresh();
      },
      error: (err) => {
        this.notification.error(err);
        this.refresh();
      }
    });
  }

  private dureeEnMinutes(heureDebut: string, heureFin: string): number {
    return this.toMinutes(heureFin) - this.toMinutes(heureDebut);
  }

  private toMinutes(heure: string): number {
    const [h, m] = heure.split(':').map(Number);
    return h * 60 + m;
  }

  private ajouterMinutes(heure: string, minutes: number): string {
    const total = this.toMinutes(heure) + minutes;
    const h = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const m = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  /** Seule l'année scolaire active peut avoir son emploi du temps modifié. */
  get anneeVerrouillee(): boolean {
    const active = this.annees.find((a) => a.actif);
    return !!this.anneeScolaireId && !!active && active.id !== this.anneeScolaireId;
  }

  openForm(seance?: EmploiDuTemps): void {
    if (!this.classeId || !this.anneeScolaireId || this.anneeVerrouillee) return;
    this.dialog
      .open(EmploiDuTempsFormDialogComponent, {
        width: '600px',
        data: { classeId: this.classeId, anneeScolaireId: this.anneeScolaireId, seance },
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.refresh();
      });
  }

  async supprimer(seance: EmploiDuTemps): Promise<void> {
    if (this.anneeVerrouillee) return;
    const confirmed = await this.notification.confirm(
      `Supprimer ce cours (${seance.matiereLibelle}, ${seance.heureDebut}-${seance.heureFin}) ?`
    );
    if (!confirmed) return;
    this.emploiDuTempsService.delete(seance.uuid!).subscribe({
      next: () => {
        this.notification.success('Cours supprimé');
        this.refresh();
      },
      error: (err) => this.notification.error(err)
    });
  }
}
