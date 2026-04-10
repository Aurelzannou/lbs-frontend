import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbIconModule, 
  NbToastrService,
  NbTooltipModule,
  NbUserModule,
  NbInputModule,
  NbFormFieldModule,
  NbSpinnerModule
} from '@nebular/theme';
import { UserService, User } from '../../../core/services/user.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserProfilDialogComponent } from './user-profil-dialog/user-profil-dialog.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
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
  template: `
    <nb-card [nbSpinner]="loading" nbSpinnerStatus="primary">
      <nb-card-header class="header-container">
        <div class="title-section">
          <h2>Gestion des Utilisateurs</h2>
          <p class="subtitle">Administrez les accès et profils des utilisateurs inscrits</p>
        </div>
        
        <div class="search-section">
          <nb-form-field>
            <nb-icon nbPrefix icon="search-outline" pack="eva"></nb-icon>
            <input #searchInput nbInput placeholder="Rechercher un utilisateur..." 
                   (input)="onSearchChange($event)" class="search-input">
            <button nbSuffix nbButton ghost (click)="clearSearch(searchInput)" *ngIf="searchTerm">
              <nb-icon icon="close-outline"></nb-icon>
            </button>
          </nb-form-field>
        </div>
      </nb-card-header>
      
      <nb-card-body>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Login</th>
                <th>Email / Keycloak ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>
                  <nb-user [name]="user.prenom + ' ' + user.nom" 
                           [title]="user.login"
                           [picture]="user.photo || ''">
                  </nb-user>
                </td>
                <td><span class="login-badge">{{ user.login }}</span></td>
                <td><small class="text-hint">{{ user.keycloack }}</small></td>
                <td>
                  <div class="action-buttons">
                    <button nbButton ghost status="primary" size="small" (click)="assignProfils(user)" nbTooltip="Gérer les profils">
                      <nb-icon icon="lock-outline"></nb-icon> PROFILS
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="users.length === 0 && !loading">
                <td colspan="4" class="no-data">Aucun utilisateur trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (Style Niveau) -->
        <div class="pagination-footer" *ngIf="totalElements > 0">
          <div class="pagination-info">
            Affichage de <b>{{ (pageIndex * pageSize) + 1 }}</b> à <b>{{ getEndIndex() }}</b> sur <b>{{ totalElements }}</b> utilisateurs
          </div>
          <div class="pagination-controls">
            <button nbButton size="small" ghost (click)="prevPage()" [disabled]="isFirstPage()">
              <nb-icon icon="arrow-ios-back-outline"></nb-icon>
            </button>
            <div class="page-numbers">
              <button *ngFor="let p of pages" nbButton size="small" 
                      [status]="p === currentPage + 1 ? 'primary' : 'basic'"
                      [appearance]="p === currentPage + 1 ? 'filled' : 'ghost'"
                      (click)="goToPage(p)">
                {{ p }}
              </button>
            </div>
            <button nbButton size="small" ghost (click)="nextPage()" [disabled]="isLastPage()">
              <nb-icon icon="arrow-ios-forward-outline"></nb-icon>
            </button>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .title-section h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    .subtitle {
      margin: 0;
      color: #8f9bb3;
      font-size: 0.9rem;
    }
    .search-input {
      width: 300px;
      border-radius: 20px;
    }
    .table-container {
      margin-top: 1rem;
      overflow-x: auto;
    }
    .custom-table {
      width: 100%;
      border-collapse: collapse;
    }
    .custom-table th {
      text-align: left;
      padding: 1rem;
      background: #f7f9fc;
      color: #222b45;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05rem;
    }
    .custom-table td {
      padding: 1rem;
      border-bottom: 1px solid #edf1f7;
    }
    .login-badge {
      background: #e4e9f2;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.8rem;
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .no-data {
      text-align: center;
      padding: 3rem !important;
      color: #8f9bb3;
      font-style: italic;
    }
    
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0 0.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .pagination-info {
      font-size: 0.85rem;
      color: #8f9bb3;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }
  `]
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  
  // Pagination et recherche
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  searchTerm = '';
  
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private userService: UserService,
    private toastrService: NbToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.pageIndex = 0;
      this.loadUsers();
    });
    this.loadUsers();
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

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        // La structure est ApiResponse -> { success, data: { data: [], meta: {} }, ... }
        const result = response.data || {};
        this.users = result.data || [];
        const meta = result.meta || {};
        this.totalElements = meta.totalElements || this.users.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs:', err);
        this.toastrService.danger('Impossible de charger les utilisateurs', 'Erreur');
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
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.pageIndex - 1);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    this.pageIndex = page - 1;
    this.loadUsers();
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadUsers();
    }
  }

  isFirstPage(): boolean { return this.pageIndex === 0; }
  isLastPage(): boolean { return this.pageIndex >= this.totalPages - 1; }
  getEndIndex(): number { return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements); }

  assignProfils(user: User): void {
    this.dialog.open(UserProfilDialogComponent, {
      width: '500px',
      data: user
    }).afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }
}
