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
  NbUserModule,
  NbInputModule,
  NbFormFieldModule,
  NbSpinnerModule
} from '@nebular/theme';
import { UserService, User } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserProfilDialogComponent } from './user-profil-dialog/user-profil-dialog.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-user-list',
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
    NbUserModule,
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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['user', 'login', 'keycloak', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
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
    this.userService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        const result = response.data || {};
        this.dataSource.data = result.data || [];
        const meta = result.meta || {};
        this.totalElements = meta.totalElements || meta.total || this.dataSource.data.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs:', err);
        this.notification.error('Impossible de charger les utilisateurs');
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

  assignProfils(user: User): void {
    this.dialog.open(UserProfilDialogComponent, {
      width: '500px',
      data: user,
      panelClass: 'professional-dialog'
    }).afterClosed().subscribe(result => {
      if (result) this.refresh();
    });
  }
}
