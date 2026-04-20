import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbIconModule, 
  NbToastrService,
  NbTooltipModule,
  NbInputModule,
  NbFormFieldModule,
  NbSpinnerModule
} from '@nebular/theme';
import { Profil, ProfilService } from '../../../core/services/profil.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProfilFormDialogComponent } from './profil-form-dialog/profil-form-dialog.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-profil-list',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NbInputModule,
    NbFormFieldModule,
    NbSpinnerModule,
    MatDialogModule
  ],
  template: `
    <nb-card [nbSpinner]="loading" nbSpinnerStatus="primary">
      <nb-card-header class="header-container">
        <div class="title-section">
          <h2>Gestion des Profils</h2>
          <p class="subtitle">Administrez les rôles et permissions des utilisateurs</p>
        </div>
        
        <div class="header-actions">
          <div class="search-section">
            <nb-form-field>
              <nb-icon nbPrefix icon="search-outline" pack="eva"></nb-icon>
              <input #searchInput nbInput placeholder="Rechercher un profil..." 
                     (input)="onSearchChange($event)" class="search-input">
              <button nbSuffix nbButton ghost (click)="clearSearch(searchInput)" *ngIf="searchTerm">
                <nb-icon icon="close-outline"></nb-icon>
              </button>
            </nb-form-field>
          </div>
          <button nbButton status="primary" (click)="addProfil()">
            <nb-icon icon="plus-outline"></nb-icon> NOUVEAU PROFIL
          </button>
        </div>
      </nb-card-header>
      
      <nb-card-body>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>UUID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let profil of profils">
                <td><span class="code-badge">{{ profil.code }}</span></td>
                <td>{{ profil.libelle }}</td>
                <td><small class="text-hint">{{ profil.uuid }}</small></td>
                <td>
                  <div class="action-buttons">
                    <button nbButton ghost status="info" size="small" (click)="editProfil(profil)" nbTooltip="Modifier">
                      <nb-icon icon="edit-2-outline"></nb-icon>
                    </button>
                    <button nbButton ghost status="danger" size="small" (click)="deleteProfil(profil)" nbTooltip="Supprimer">
                      <nb-icon icon="trash-2-outline"></nb-icon>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="profils.length === 0 && !loading">
                <td colspan="4" class="no-data">Aucun profil trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-footer" *ngIf="totalElements > 0">
          <div class="pagination-info">
            Affichage de <b>{{ (pageIndex * pageSize) + 1 }}</b> à <b>{{ getEndIndex() }}</b> sur <b>{{ totalElements }}</b> profils
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
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
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
      width: 250px;
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
    .code-badge {
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
export class ProfilListComponent implements OnInit, OnDestroy {
  profils: Profil[] = [];
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
    private profilService: ProfilService,
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
      this.loadProfils();
    });
    this.loadProfils();
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

  loadProfils(): void {
    this.loading = true;
    this.profilService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        // ApiService return already response.data -> { data: [], meta: {} }
        this.profils = response.data || [];
        const meta = response.meta || {};
        this.totalElements = meta.totalElements || this.profils.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement profils:', err);
        this.toastrService.danger('Impossible de charger les profils', 'Erreur');
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
    this.loadProfils();
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.loadProfils();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadProfils();
    }
  }

  isFirstPage(): boolean { return this.pageIndex === 0; }
  isLastPage(): boolean { return this.pageIndex >= this.totalPages - 1; }
  getEndIndex(): number { return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements); }

  addProfil(): void {
    this.dialog.open(ProfilFormDialogComponent, {
      width: '450px'
    }).afterClosed().subscribe(result => {
      if (result) this.loadProfils();
    });
  }

  editProfil(profil: Profil): void {
    this.dialog.open(ProfilFormDialogComponent, {
      width: '450px',
      data: profil
    }).afterClosed().subscribe(result => {
      if (result) this.loadProfils();
    });
  }

  deleteProfil(profil: Profil): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le profil ${profil.code} ?`)) {
      this.loading = true;
      this.profilService.delete(profil.id).subscribe({
        next: () => {
          this.toastrService.success(`Profil ${profil.code} supprimé`, 'Succès');
          this.loadProfils();
        },
        error: (err) => {
          this.toastrService.danger('Erreur lors de la suppression', 'Erreur');
          this.loading = false;
        }
      });
    }
  }
}
