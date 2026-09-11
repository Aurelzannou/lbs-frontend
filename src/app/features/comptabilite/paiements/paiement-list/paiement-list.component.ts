import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaiementService } from '../../../../core/services/paiement.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Paiement } from '../../../../core/models/paiement.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { PaiementFormDialogComponent } from '../paiement-form-dialog/paiement-form-dialog.component';
import { PdfPreviewDialogComponent } from '../../../notes/pdf-preview-dialog/pdf-preview-dialog.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-paiement-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NgSelectModule,
    FormsModule
  ],
  animations: [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-20px)', 'box-shadow': 'none' }),
        animate('0.3s ease-out', style({ height: '*', opacity: '1', transform: 'translateX(0)' }))
      ])
    ])
  ],
  templateUrl: './paiement-list.component.html',
  styleUrl: './paiement-list.component.scss'
})
export class PaiementListComponent implements OnInit, OnDestroy, AfterViewInit {
  private paiementService = inject(PaiementService);
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = [
    'eleve',
    'frais',
    'montant',
    'modePaiement',
    'caisse',
    'statut',
    'datePaiement',
    'actions'
  ];
  dataSource = new MatTableDataSource<Paiement>([]);
  loading = false;
  recuEnCours: number | null = null;
  annulationEnCours: number | null = null;

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  searchTerm = '';

  annees: (AnneeScolaire | { id: null; libelle: string })[] = [];
  /** Filtre par défaut sur l'année scolaire active — "Toutes les années" (id null) le lève. */
  anneeScolaireId: number | null = null;

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.pageIndex = 0;
        this.refresh();
      });
    this.loadAnnees();
  }

  /** Charge les années scolaires et sélectionne l'année active par défaut, puis lance le premier
      chargement des paiements. */
  loadAnnees(): void {
    this.anneeService.getAll(0, 50).subscribe((res: any) => {
      const page = res.data ?? res;
      const list: AnneeScolaire[] = page.data ?? (Array.isArray(page) ? page : []);
      this.annees = [{ id: null, libelle: 'Toutes les années' }, ...list];
      const active = list.find((a) => a.actif);
      this.anneeScolaireId = active?.id ?? null;
      this.refresh();
    });
  }

  onAnneeChange(): void {
    this.pageIndex = 0;
    this.refresh();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  refresh(): void {
    this.loading = true;
    this.paiementService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm, this.anneeScolaireId).subscribe({
      next: (response: any) => {
        const items = response.data || (Array.isArray(response) ? response : []);
        const meta = response.meta || {};

        this.dataSource.data = items;
        this.totalElements = meta.totalElements || meta.total || items.length;

        if (this.paginator) {
          this.paginator.length = this.totalElements;
          this.paginator.pageIndex = this.pageIndex;
          this.paginator.pageSize = this.pageSize;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Impossible de charger les paiements');
        this.loading = false;
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }
  getEndIndex(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements);
  }
  goToPage(page: number): void {
    const index = page - 1;
    if (index < 0 || index >= this.totalPages) return;
    this.pageIndex = index;
    this.refresh();
  }
  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.refresh();
    }
  }
  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.refresh();
    }
  }
  isFirstPage(): boolean {
    return this.pageIndex === 0;
  }
  isLastPage(): boolean {
    return this.pageIndex >= this.totalPages - 1;
  }

  openForm(): void {
    this.dialog
      .open(PaiementFormDialogComponent, {
        width: '560px',
        maxWidth: '95vw',
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.refresh();
      });
  }

  voirRecu(paiement: Paiement): void {
    this.recuEnCours = paiement.id ?? null;
    this.paiementService.getRecuPdf(paiement.uuid!).subscribe({
      next: (blob) => {
        this.dialog.open(PdfPreviewDialogComponent, {
          width: '700px',
          maxWidth: '95vw',
          height: '860px',
          maxHeight: '92vh',
          panelClass: 'professional-dialog',
          data: {
            blob,
            filename: `recu-${paiement.code}.pdf`,
            title: `Reçu ${paiement.code}`
          }
        });
        this.recuEnCours = null;
      },
      error: () => {
        this.notification.error('Impossible de générer le reçu');
        this.recuEnCours = null;
      }
    });
  }

  async annuler(paiement: Paiement): Promise<void> {
    const confirmed = await this.notification.confirm(
      `Annuler ce paiement de ${paiement.montant} FCFA ? Un mouvement compensatoire sera enregistré en caisse.`
    );
    if (!confirmed) return;

    this.annulationEnCours = paiement.id ?? null;
    this.paiementService.annuler(paiement.uuid!).subscribe({
      next: () => {
        this.notification.success('Paiement annulé');
        this.annulationEnCours = null;
        this.refresh();
      },
      error: (err) => {
        this.notification.error(err?.error?.message || "Impossible d'annuler ce paiement");
        this.annulationEnCours = null;
      }
    });
  }
}
