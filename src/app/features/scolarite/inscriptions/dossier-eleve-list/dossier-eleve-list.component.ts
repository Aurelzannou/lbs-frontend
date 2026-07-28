import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DossierEleveService } from '../../../../core/services/dossier-eleve.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DossierEleve } from '../../../../core/models/dossier-eleve.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { DossierEleveFormDialogComponent } from '../dossier-eleve-form-dialog/dossier-eleve-form-dialog.component';
import { HistoriqueDialogComponent } from '../../shared/historique-dialog/historique-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-dossier-eleve-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    NgSelectModule
  ],
  templateUrl: './dossier-eleve-list.component.html',
  styleUrl: './dossier-eleve-list.component.scss'
})
export class DossierEleveListComponent implements OnInit, OnDestroy {
  private dossierService = inject(DossierEleveService);
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  dossiers: DossierEleve[] = [];
  annees: AnneeScolaire[] = [];
  loading = false;
  searchTerm = '';
  anneeId: number | null = null;

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  ngOnInit(): void {
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.pageIndex = 0;
        this.refresh();
      });

    this.loadAnnees();

    this.route.queryParams.subscribe((params) => {
      if (params['openForm'] === 'true') this.openForm();
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadAnnees(): void {
    this.anneeService.getAll(0, 50).subscribe({
      next: (res: any) => {
        const page = res.data ?? res;
        this.annees = page.data ?? (Array.isArray(page) ? page : []);
        // Présélectionner l'année active
        const active = this.annees.find((a) => a.actif);
        if (active?.id) {
          this.anneeId = active.id;
        }
        this.refresh();
      },
      error: () => this.refresh()
    });
  }

  onSearchChange(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onAnneeChange(): void {
    this.pageIndex = 0;
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.dossierService
      .getAll(this.pageIndex + 1, this.pageSize, this.searchTerm, this.anneeId)
      .subscribe({
        next: (response: any) => {
          const page = response.data ?? response;
          const all = page.data ?? (Array.isArray(page) ? page : []);
          this.dossiers = all;
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

  // ── Actions individuelles ─────────────────────────────────────────────────

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

  openForm(dossier?: DossierEleve): void {
    this.dialog
      .open(DossierEleveFormDialogComponent, {
        width: '800px',
        data: dossier,
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.refresh();
      });
  }

  voirHistorique(dossier: DossierEleve): void {
    this.dialog.open(HistoriqueDialogComponent, {
      width: '560px',
      data: { uuid: dossier.uuid, numero: dossier.numero || '—' }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }
  isFirstPage(): boolean {
    return this.pageIndex === 0;
  }
  isLastPage(): boolean {
    return this.pageIndex >= this.totalPages - 1;
  }
  nextPage(): void {
    if (!this.isLastPage()) {
      this.pageIndex++;
      this.refresh();
    }
  }
  prevPage(): void {
    if (!this.isFirstPage()) {
      this.pageIndex--;
      this.refresh();
    }
  }
}
