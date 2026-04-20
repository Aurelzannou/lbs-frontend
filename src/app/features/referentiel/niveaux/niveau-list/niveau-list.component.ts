import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbIconModule, 
  NbInputModule, 
  NbTooltipModule,
  NbFormFieldModule,
  NbSpinnerModule
} from '@nebular/theme';
import { NiveauFormDialogComponent } from '../niveau-form-dialog/niveau-form-dialog.component';
import { NiveauService } from '../../../../core/services/niveau.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Niveau } from '../../../../core/models/niveau.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-niveau-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatDialogModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbTooltipModule,
    NbFormFieldModule,
    NbSpinnerModule
  ],
  animations: [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-20px)', 'box-shadow': 'none' }),
        animate('0.3s ease-out', style({ height: '*', opacity: '1', transform: 'translateX(0)' })),
      ])
    ])
  ],
  templateUrl: './niveau-list.component.html',
  styleUrl: './niveau-list.component.scss'
})
export class NiveauListComponent implements OnInit, AfterViewInit, OnDestroy {
  private niveauService = inject(NiveauService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['code', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Niveau>([]);
  loading = false;
  totalElements = 0;
  pageIndex = 0; // 0-based pour l'affichage interne
  pageSize = 25;
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    // Debounce : attend 300ms après la dernière frappe avant d'appeler le backend
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.pageIndex = 0; // Retour à la 1ère page à chaque nouvelle recherche
      this.refresh();
    });
    this.refresh();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(inputEl: HTMLInputElement): void {
    inputEl.value = '';
    this.searchSubject.next('');
  }

  // --- Custom Pagination Methods (Server-Side) ---
  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }

  get currentPage(): number {
    return this.pageIndex;
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i + 1);
    }
    return pages;
  }

  goToPage(page: number): void {
    const index = page - 1; // Convertir en 0-based
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

  getEndIndex(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements);
  }
  // --------------------------------

  refresh(): void {
    this.loading = true;
    console.log('[NiveauList] refresh() appelé - page:', this.pageIndex, 'taille:', this.pageSize, 'filtre:', this.searchTerm);
    // L'API utilise une pagination 1-based (page 1 = première page)
    this.niveauService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        console.log('[NiveauList] données reçues:', response);

        // Gérer la structure de réponse paginée { data: [...], meta: {...} }
        const items = response.data || (Array.isArray(response) ? response : []);
        const meta = response.meta || {};

        this.totalElements = meta.totalElements || meta.total || items.length;

        console.log('[NiveauList] éléments à afficher:', items.length, 'Total:', this.totalElements);

        this.dataSource.data = items;

        // Mettre à jour le paginator caché pour la compatibilité Material
        if (this.paginator) {
          this.paginator.length = this.totalElements;
          this.paginator.pageIndex = this.pageIndex;
          this.paginator.pageSize = this.pageSize;
        }
        if (this.sort && !this.dataSource.sort) {
          this.dataSource.sort = this.sort;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[NiveauList] erreur de chargement des niveaux:', err);
        this.notification.error('Impossible de charger les niveaux');
        this.loading = false;
      }
    });
  }

  openForm(niveau?: Niveau): void {
    const dialogRef = this.dialog.open(NiveauFormDialogComponent, {
      width: '400px',
      data: niveau,
      panelClass: 'professional-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  async deleteNiveau(niveau: Niveau): Promise<void> {
    const confirmed = await this.notification.confirm(`Êtes-vous sûr de vouloir supprimer le niveau "${niveau.libelle}" ?`);
    if (confirmed) {
      this.loading = true;
      this.niveauService.delete(niveau.uuid!).subscribe({
        next: () => {
          this.notification.success('Niveau supprimé avec succès');
          this.refresh();
        },
        error: () => {
          this.notification.error('Erreur lors de la suppression');
          this.loading = false;
        }
      });
    }
  }
}
