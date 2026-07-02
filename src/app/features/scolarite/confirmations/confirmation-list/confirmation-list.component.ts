import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { HistoriqueDialogComponent } from '../../shared/historique-dialog/historique-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-confirmation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatTooltipModule, NgSelectModule],
  templateUrl: './confirmation-list.component.html',
  styleUrl: './confirmation-list.component.scss'
})
export class ConfirmationListComponent implements OnInit, OnDestroy {
  private confirmationService = inject(ConfirmationService);
  private anneeService        = inject(AnneeScolaireService);
  private notification        = inject(NotificationService);
  private dialog              = inject(MatDialog);
  private cdr                 = inject(ChangeDetectorRef);

  dossiers: any[]         = [];
  annees: AnneeScolaire[] = [];
  loading    = false;
  activeTab  = 'ACCEPTE';
  searchTerm = '';
  anneeId: number | null = null;
  selected   = new Set<string>();

  readonly tabs = [
    { code: 'ACCEPTE', label: 'Acceptés' },
    { code: 'INSCRIT', label: 'Inscrits' },
  ];

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300), distinctUntilChanged()
    ).subscribe(() => { this.refresh(); });

    this.loadAnnees();
  }

  ngOnDestroy(): void { this.searchSub?.unsubscribe(); }

  loadAnnees(): void {
    this.anneeService.getAll(0, 50).subscribe({
      next: (res: any) => {
        const page = res.data ?? res;
        this.annees = page.data ?? (Array.isArray(page) ? page : []);
        const active = this.annees.find(a => a.actif);
        if (active?.id) { this.anneeId = active.id; }
        this.refresh();
      },
      error: () => this.refresh()
    });
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(this.searchTerm);
  }

  onAnneeChange(): void { this.selected.clear(); this.refresh(); }

  selectTab(code: string): void { this.activeTab = code; this.selected.clear(); this.refresh(); }

  refresh(): void {
    this.loading = true;
    this.selected.clear();
    this.confirmationService.getDossiers(this.activeTab, this.anneeId, this.searchTerm).subscribe({
      next: (res: any) => {
        this.dossiers = res.data ?? (Array.isArray(res) ? res : []);
        this.loading  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.notification.error('Impossible de charger les dossiers'); this.loading = false; }
    });
  }

  // ── Sélection ──────────────────────────────────────────────────────────────

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectableDossiers.forEach(d => this.selected.add(d.uuid));
    else this.selected.clear();
  }

  toggleRow(uuid: string): void {
    if (this.selected.has(uuid)) this.selected.delete(uuid);
    else this.selected.add(uuid);
  }

  get selectableDossiers(): any[] { return this.dossiers.filter(d => this.canInscrire(d)); }

  get allSelected(): boolean {
    return this.selectableDossiers.length > 0 &&
           this.selectableDossiers.every(d => this.selected.has(d.uuid));
  }

  get someSelected(): boolean { return this.selected.size > 0; }

  // ── Inscrire en masse ─────────────────────────────────────────────────────

  async inscrireSelection(): Promise<void> {
    const uuids = [...this.selected];
    const ok = await this.notification.confirm(`Confirmer l'inscription de ${uuids.length} élève(s) ?`);
    if (!ok) return;
    this.loading = true;
    forkJoin(uuids.map(uuid => this.confirmationService.inscrire(uuid).pipe(catchError(() => of(null)))))
      .subscribe(() => { this.notification.success(`${uuids.length} élève(s) inscrit(s)`); this.refresh(); });
  }

  // ── Action individuelle ───────────────────────────────────────────────────

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
    this.dialog.open(HistoriqueDialogComponent, { width: '560px', data: { uuid: d.uuid, numero: d.numero } });
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      ACCEPTE: 'st-accepte', INSCRIT: 'st-inscrit',
      DEPOSE: 'st-depose', REFUSE: 'st-refuse'
    };
    return map[code] || 'st-default';
  }
}
