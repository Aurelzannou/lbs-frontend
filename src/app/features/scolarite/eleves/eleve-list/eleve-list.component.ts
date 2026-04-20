import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbIconModule, 
  NbTooltipModule,
  NbInputModule,
  NbFormFieldModule,
  NbSpinnerModule,
  NbUserModule
} from '@nebular/theme';
import { EleveService } from '../../../../core/services/eleve.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Eleve } from '../../../../core/models/eleve.model';
import { EleveFormDialogComponent } from '../eleve-form-dialog/eleve-form-dialog.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-eleve-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NbInputModule,
    NbFormFieldModule,
    NbSpinnerModule,
    NbUserModule,
    MatDialogModule
  ],
  animations: [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-20px)', 'box-shadow': 'none' }),
        animate('0.3s ease-out', style({ height: '*', opacity: '1', transform: 'translateX(0)' })),
      ])
    ])
  ],
  templateUrl: './eleve-list.component.html',
  styleUrl: './eleve-list.component.scss'
})
export class EleveListComponent implements OnInit, OnDestroy, AfterViewInit {
  private eleveService = inject(EleveService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['matricule', 'identite', 'sexe', 'actions'];
  dataSource = new MatTableDataSource<Eleve>([]);
  loading = false;

  // Pagination et recherche
  totalElements = 0;
  pageIndex = 0; // 0-based pour l'affichage interne
  pageSize = 10;
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
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
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchSubject.next('');
  }

  refresh(): void {
    this.loading = true;
    // L'API utilise une pagination 1-based
    this.eleveService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        const items = response.data || (Array.isArray(response) ? response : []);
        const meta = response.meta || {};
        
        this.dataSource.data = items;
        this.totalElements = meta.totalElements || meta.total || items.length;

        // Mise à jour du paginator pour la cohérence
        if (this.paginator) {
          this.paginator.length = this.totalElements;
          this.paginator.pageIndex = this.pageIndex;
          this.paginator.pageSize = this.pageSize;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement élèves:', err);
        this.notification.error('Impossible de charger les élèves');
        this.loading = false;
      }
    });
  }

  // --- Pagination Methods ---
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

  isFirstPage(): boolean { return this.pageIndex === 0; }
  isLastPage(): boolean { return this.pageIndex >= this.totalPages - 1; }
  getEndIndex(): number { return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements); }

  openForm(eleve?: Eleve): void {
    this.dialog.open(EleveFormDialogComponent, {
      width: '600px',
      data: eleve,
      panelClass: 'professional-dialog'
    }).afterClosed().subscribe(result => {
      if (result) this.refresh();
    });
  }

  async deleteEleve(eleve: Eleve): Promise<void> {
    const confirmed = await this.notification.confirm(`Souhaitez-vous vraiment supprimer l'élève ${eleve.nom} ${eleve.prenom} ?`);
    if (confirmed) {
      this.loading = true;
      this.eleveService.delete(eleve.matricule).subscribe({
        next: () => {
          this.notification.success('Élève supprimé avec succès');
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
