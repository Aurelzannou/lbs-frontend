import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { ValidationService } from '../../../../core/services/validation.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { Classe } from '../../../../core/models/classe.model';
import { RefusDialogComponent } from '../refus-dialog/refus-dialog.component';
import { HistoriqueDialogComponent } from '../../shared/historique-dialog/historique-dialog.component';
import { DossierEleveFormDialogComponent } from '../../inscriptions/dossier-eleve-form-dialog/dossier-eleve-form-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-validation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NgSelectModule
  ],
  templateUrl: './validation-list.component.html',
  styleUrl: './validation-list.component.scss'
})
export class ValidationListComponent implements OnInit, OnDestroy {
  private validationService = inject(ValidationService);
  private anneeService = inject(AnneeScolaireService);
  private classeService = inject(ClasseService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  dossiers: any[] = [];
  annees: (AnneeScolaire | { id: null; libelle: string })[] = [];
  classes: (Classe | { id: null; libelle: string; code: string })[] = [];
  loading = false;
  activeTab = 'DEPOSE';
  searchTerm = '';
  anneeId: number | null = null;
  classeId: number | null = null;
  selected = new Set<string>();

  readonly tabs = [
    { code: 'DEPOSE', label: 'Déposés' },
    { code: 'ACCEPTE', label: 'Acceptés' },
    { code: 'REFUSE', label: 'Refusés' }
  ];

  /** Nombre de dossiers par statut, tous onglets confondus — pour afficher un badge sur chacun. */
  tabCounts: Record<string, number> = { DEPOSE: 0, ACCEPTE: 0, REFUSE: 0 };

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  ngOnInit(): void {
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.refresh();
      });

    this.loadAnnees();
    this.loadClasses();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadClasses(): void {
    this.classeService.getAll(1, 100).subscribe((res: any) => {
      const list = res.data ?? (Array.isArray(res) ? res : []);
      this.classes = [{ id: null, libelle: 'Toutes les classes', code: '' }, ...list];
    });
  }

  onClasseChange(): void {
    this.selected.clear();
    this.refresh();
  }

  loadAnnees(): void {
    this.anneeService.getAll(0, 50).subscribe({
      next: (res: any) => {
        const page = res.data ?? res;
        const list = page.data ?? (Array.isArray(page) ? page : []);
        const active = list.find((a: any) => a.actif);
        if (active?.id) {
          this.anneeId = active.id;
        }
        this.annees = [{ id: null, libelle: 'Toutes les années' }, ...list];
        this.refresh();
      },
      error: () => this.refresh()
    });
  }

  onSearchChange(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  onAnneeChange(): void {
    this.selected.clear();
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.selected.clear();
    this.validationService
      .getAll(this.activeTab, this.anneeId, this.searchTerm, this.classeId)
      .subscribe({
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
    this.loadTabCounts();
  }

  /** Recharge le nombre de dossiers de chaque statut, pour que les badges des onglets restent à jour. */
  private loadTabCounts(): void {
    forkJoin(
      this.tabs.map((t) =>
        this.validationService
          .getAll(t.code, this.anneeId, undefined, this.classeId)
          .pipe(catchError(() => of({ data: [] })))
      )
    ).subscribe((results) => {
      results.forEach((res: any, i) => {
        const list = res.data ?? (Array.isArray(res) ? res : []);
        this.tabCounts[this.tabs[i].code] = list.length;
      });
      this.cdr.detectChanges();
    });
  }

  selectTab(code: string): void {
    this.activeTab = code;
    this.selected.clear();
    this.refresh();
  }

  // ── Sélection ──────────────────────────────────────────────────────────────

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectableDossiers.forEach((d) => this.selected.add(d.uuid));
    else this.selected.clear();
  }

  toggleRow(uuid: string): void {
    if (this.selected.has(uuid)) this.selected.delete(uuid);
    else this.selected.add(uuid);
  }

  get selectableDossiers(): any[] {
    return this.dossiers.filter((d) => this.canAccepter(d) || this.canRefuser(d));
  }

  get allSelected(): boolean {
    return (
      this.selectableDossiers.length > 0 &&
      this.selectableDossiers.every((d) => this.selected.has(d.uuid))
    );
  }

  get someSelected(): boolean {
    return this.selected.size > 0;
  }

  // ── Actions en masse ──────────────────────────────────────────────────────

  async accepterSelection(): Promise<void> {
    const uuids = [...this.selected];
    const ok = await this.notification.confirm(`Accepter ${uuids.length} dossier(s) ?`);
    if (!ok) return;
    this.loading = true;
    forkJoin(
      uuids.map((uuid) => this.validationService.accepter(uuid).pipe(catchError(() => of(null))))
    ).subscribe(() => {
      this.notification.success(`${uuids.length} dossier(s) accepté(s)`);
      this.refresh();
    });
  }

  refuserSelection(): void {
    const uuids = [...this.selected];
    this.dialog
      .open(RefusDialogComponent, {
        width: '500px',
        data: { numero: `${uuids.length} dossier(s)` }
      })
      .afterClosed()
      .subscribe((motif) => {
        if (motif === undefined) return;
        this.loading = true;
        forkJoin(
          uuids.map((uuid) =>
            this.validationService.refuser(uuid, motif).pipe(catchError(() => of(null)))
          )
        ).subscribe(() => {
          this.notification.success(`${uuids.length} dossier(s) refusé(s)`);
          this.refresh();
        });
      });
  }

  // ── Actions individuelles ─────────────────────────────────────────────────

  canAccepter(d: any): boolean {
    return d.statutCode === 'DEPOSE';
  }
  canRefuser(d: any): boolean {
    return d.statutCode === 'DEPOSE';
  }

  async accepter(d: any): Promise<void> {
    const ok = await this.notification.confirm(`Accepter le dossier ${d.numero} ?`);
    if (!ok) return;
    this.validationService.accepter(d.uuid).subscribe({
      next: () => {
        this.notification.success('Dossier accepté');
        this.refresh();
      },
      error: () => this.notification.error("Erreur lors de l'acceptation")
    });
  }

  refuser(d: any): void {
    this.dialog
      .open(RefusDialogComponent, { width: '500px', data: { numero: d.numero } })
      .afterClosed()
      .subscribe((motif) => {
        if (motif === undefined) return;
        this.validationService.refuser(d.uuid, motif).subscribe({
          next: () => {
            this.notification.success('Dossier refusé');
            this.refresh();
          },
          error: () => this.notification.error('Erreur lors du refus')
        });
      });
  }

  voirHistorique(d: any): void {
    this.dialog.open(HistoriqueDialogComponent, {
      width: '560px',
      data: { uuid: d.uuid, numero: d.numero }
    });
  }

  modifier(d: any): void {
    this.dialog
      .open(DossierEleveFormDialogComponent, {
        width: '800px',
        data: d,
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.refresh();
      });
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      DEPOSE: 'st-depose',
      EN_ATTENTE: 'st-attente',
      ACCEPTE: 'st-accepte',
      REFUSE: 'st-refuse',
      INSCRIT: 'st-inscrit'
    };
    return map[code] || 'st-default';
  }
}
