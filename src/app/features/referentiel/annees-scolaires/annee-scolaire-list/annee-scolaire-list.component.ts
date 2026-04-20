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
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AnneeScolaireFormDialogComponent } from '../annee-scolaire-form-dialog/annee-scolaire-form-dialog.component';

@Component({
  selector: 'app-annee-scolaire-list',
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
  templateUrl: './annee-scolaire-list.component.html',
  styleUrl: './annee-scolaire-list.component.scss'
})
export class AnneeScolaireListComponent implements OnInit, AfterViewInit, OnDestroy {
  private anneeScolaireService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['code', 'libelle', 'dateDebut', 'dateFin', 'actif', 'actions'];
  dataSource = new MatTableDataSource<AnneeScolaire>([]);
  loading = false;
  totalElements = 0;
  pageIndex = 0;
  pageSize = 25;
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
      this.pageIndex = 0;
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

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }

  get currentPage(): number {
    return this.pageIndex;
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

  refresh(): void {
    this.loading = true;
    this.anneeScolaireService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        const items = response.data || (Array.isArray(response) ? response : []);
        const meta = response.meta || {};
        this.totalElements = meta.totalElements || meta.total || items.length;
        this.dataSource.data = items;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notification.error('Impossible de charger les années scolaires');
        this.loading = false;
      }
    });
  }

  openForm(anneeScolaire?: AnneeScolaire): void {
    const dialogRef = this.dialog.open(AnneeScolaireFormDialogComponent, {
      width: '500px',
      data: anneeScolaire,
      panelClass: 'professional-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  async deleteAnneeScolaire(anneeScolaire: AnneeScolaire): Promise<void> {
    const confirmed = await this.notification.confirm(`Êtes-vous sûr de vouloir supprimer l'année scolaire "${anneeScolaire.libelle}" ?`);
    if (confirmed) {
      this.loading = true;
      this.anneeScolaireService.delete(anneeScolaire.uuid!).subscribe({
        next: () => {
          this.notification.success('Année scolaire supprimée avec succès');
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
