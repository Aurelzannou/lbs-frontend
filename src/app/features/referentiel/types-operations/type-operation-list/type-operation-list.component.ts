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
  NbSpinnerModule
} from '@nebular/theme';
import { TypeOperationService } from '../../../../core/services/type-operation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TypeOperation } from '../../../../core/models/type-operation.model';
import { TypeOperationFormDialogComponent } from '../type-operation-form-dialog/type-operation-form-dialog.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-type-operation-list',
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
  templateUrl: './type-operation-list.component.html',
  styleUrl: './type-operation-list.component.scss'
})
export class TypeOperationListComponent implements OnInit, OnDestroy, AfterViewInit {
  private typeOperationService = inject(TypeOperationService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['code', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<TypeOperation>([]);
  loading = false;

  totalElements = 0;
  pageIndex = 0;
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

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchSubject.next('');
  }

  refresh(): void {
    this.loading = true;
    this.typeOperationService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
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
      error: (err) => {
        console.error('Erreur chargement types d\'opérations:', err);
        this.notification.error('Impossible de charger les types d\'opérations');
        this.loading = false;
      }
    });
  }

  get totalPages(): number { return Math.ceil(this.totalElements / this.pageSize) || 1; }
  get currentPage(): number { return this.pageIndex; }
  getEndIndex(): number { return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements); }

  goToPage(page: number): void {
    const index = page - 1;
    if (index < 0 || index >= this.totalPages) return;
    this.pageIndex = index;
    this.refresh();
  }

  nextPage(): void { if (this.pageIndex < this.totalPages - 1) { this.pageIndex++; this.refresh(); } }
  prevPage(): void { if (this.pageIndex > 0) { this.pageIndex--; this.refresh(); } }
  isFirstPage(): boolean { return this.pageIndex === 0; }
  isLastPage(): boolean { return this.pageIndex >= this.totalPages - 1; }

  openForm(typeOperation?: TypeOperation): void {
    this.dialog.open(TypeOperationFormDialogComponent, {
      width: '400px',
      data: typeOperation,
      panelClass: 'professional-dialog'
    }).afterClosed().subscribe(result => {
      if (result) this.refresh();
    });
  }

  async deleteTypeOperation(typeOperation: TypeOperation): Promise<void> {
    const confirmed = await this.notification.confirm(`Souhaitez-vous vraiment supprimer le type d'opération ${typeOperation.libelle} ?`);
    if (confirmed) {
      this.loading = true;
      this.typeOperationService.delete(typeOperation.uuid!).subscribe({
        next: () => {
          this.notification.success('Type d\'opération supprimé avec succès');
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
