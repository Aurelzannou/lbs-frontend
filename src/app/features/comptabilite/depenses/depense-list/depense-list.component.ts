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
import { DepenseScolaireService } from '../../../../core/services/depense-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DepenseScolaire } from '../../../../core/models/depense-scolaire.model';
import { DepenseFormDialogComponent } from '../depense-form-dialog/depense-form-dialog.component';
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
  selector: 'app-depense-list',
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
    MatDialogModule
  ],
  animations: [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-20px)', 'box-shadow': 'none' }),
        animate('0.3s ease-out', style({ height: '*', opacity: '1', transform: 'translateX(0)' }))
      ])
    ])
  ],
  templateUrl: './depense-list.component.html',
  styleUrl: './depense-list.component.scss'
})
export class DepenseListComponent implements OnInit, OnDestroy, AfterViewInit {
  private depenseService = inject(DepenseScolaireService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['motif', 'categorie', 'caisse', 'montant', 'dateDepense', 'statut', 'actions'];
  dataSource = new MatTableDataSource<DepenseScolaire>([]);
  loading = false;
  annulationEnCours: number | null = null;

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  searchTerm = '';

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
    this.depenseService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
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
        this.notification.error('Impossible de charger les dépenses');
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
      .open(DepenseFormDialogComponent, {
        width: '560px',
        maxWidth: '95vw',
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.refresh();
      });
  }

  async annuler(depense: DepenseScolaire): Promise<void> {
    const confirmed = await this.notification.confirm(
      `Annuler cette dépense de ${depense.montant} FCFA ? Un mouvement compensatoire sera enregistré en caisse.`
    );
    if (!confirmed) return;

    this.annulationEnCours = depense.id ?? null;
    this.depenseService.annuler(depense.uuid!).subscribe({
      next: () => {
        this.notification.success('Dépense annulée');
        this.annulationEnCours = null;
        this.refresh();
      },
      error: (err) => {
        this.notification.error(err?.error?.message || "Impossible d'annuler cette dépense");
        this.annulationEnCours = null;
      }
    });
  }
}
