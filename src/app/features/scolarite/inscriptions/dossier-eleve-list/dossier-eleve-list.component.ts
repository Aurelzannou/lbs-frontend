import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DossierEleveService } from '../../../../core/services/dossier-eleve.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DossierEleve } from '../../../../core/models/dossier-eleve.model';
import { DossierEleveFormDialogComponent } from '../dossier-eleve-form-dialog/dossier-eleve-form-dialog.component';
import { HistoriqueDialogComponent } from '../../shared/historique-dialog/historique-dialog.component';

@Component({
  selector: 'app-dossier-eleve-list',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule,
    MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './dossier-eleve-list.component.html',
  styleUrl: './dossier-eleve-list.component.scss'
})
export class DossierEleveListComponent implements OnInit, OnDestroy {
  private dossierService = inject(DossierEleveService);
  private notification   = inject(NotificationService);
  private dialog         = inject(MatDialog);
  private cdr            = inject(ChangeDetectorRef);
  private route          = inject(ActivatedRoute);

  dossiers: DossierEleve[] = [];
  loading = false;
  activeTab = 'DEPOSE';
  searchTerm = '';

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  readonly tabs = [
    { code: 'DEPOSE',    label: 'Déposés'    },
    { code: 'EN_ATTENTE', label: 'En attente' },
  ];

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300), distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.pageIndex = 0;
      this.refresh();
    });

    this.refresh();
    this.route.queryParams.subscribe(params => {
      if (params['openForm'] === 'true') this.openForm();
    });
  }

  ngOnDestroy(): void { this.searchSub?.unsubscribe(); }

  selectTab(code: string): void {
    this.activeTab = code;
    this.pageIndex = 0;
    this.refresh();
  }

  onSearchChange(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  refresh(): void {
    this.loading = true;
    this.dossierService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        const page  = response.data ?? response;
        const all   = page.data ?? (Array.isArray(page) ? page : []);
        this.dossiers = all.filter((d: any) =>
          (d.statutCode || d.statut?.code) === this.activeTab
        );
        this.totalElements = this.dossiers.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Impossible de charger les dossiers');
        this.loading = false;
      }
    });
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      DEPOSE: 'st-depose', EN_ATTENTE: 'st-attente',
      ACCEPTE: 'st-accepte', REFUSE: 'st-refuse', INSCRIT: 'st-inscrit'
    };
    return map[code] || 'st-default';
  }

  openForm(dossier?: DossierEleve): void {
    this.dialog.open(DossierEleveFormDialogComponent, {
      width: '800px', data: dossier, panelClass: 'professional-dialog'
    }).afterClosed().subscribe(result => { if (result) this.refresh(); });
  }

  voirHistorique(dossier: DossierEleve): void {
    this.dialog.open(HistoriqueDialogComponent, {
      width: '560px',
      data: { uuid: dossier.uuid, numero: dossier.numero || '—' }
    });
  }

  async deleteDossier(dossier: DossierEleve): Promise<void> {
    const ok = await this.notification.confirm(`Supprimer le dossier ${dossier.numero} ?`);
    if (!ok) return;
    this.loading = true;
    this.dossierService.delete(dossier.uuid!).subscribe({
      next: () => { this.notification.success('Dossier supprimé'); this.refresh(); },
      error: () => { this.notification.error('Erreur lors de la suppression'); this.loading = false; }
    });
  }

  get totalPages(): number { return Math.ceil(this.totalElements / this.pageSize) || 1; }
  isFirstPage(): boolean { return this.pageIndex === 0; }
  isLastPage(): boolean  { return this.pageIndex >= this.totalPages - 1; }
  getEndIndex(): number  { return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements); }
  nextPage(): void { if (!this.isLastPage()) { this.pageIndex++; this.refresh(); } }
  prevPage(): void { if (!this.isFirstPage()) { this.pageIndex--; this.refresh(); } }
}
