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
import { EleveService } from '../../../../core/services/eleve.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Eleve } from '../../../../core/models/eleve.model';
import { Classe } from '../../../../core/models/classe.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { EleveFormDialogComponent } from '../eleve-form-dialog/eleve-form-dialog.component';
import { EleveDetailDialogComponent } from '../eleve-detail-dialog/eleve-detail-dialog.component';
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
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-eleve-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    EleveDetailDialogComponent
  ],
  animations: [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-20px)', 'box-shadow': 'none' }),
        animate('0.3s ease-out', style({ height: '*', opacity: '1', transform: 'translateX(0)' }))
      ])
    ])
  ],
  templateUrl: './eleve-list.component.html',
  styleUrl: './eleve-list.component.scss'
})
export class EleveListComponent implements OnInit, OnDestroy, AfterViewInit {
  private eleveService = inject(EleveService);
  private classeService = inject(ClasseService);
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = [
    'identite',
    'sexe',
    'dateNaissance',
    'age',
    'classe',
    'souffrant',
    'provenance',
    'actions'
  ];
  dataSource = new MatTableDataSource<Eleve>([]);
  loading = false;
  exportListeEnCours = false;

  classes: (Classe | { id: null; libelle: string; code: string })[] = [];
  classeId: number | null = null;

  annees: (AnneeScolaire | { id: null; libelle: string })[] = [];
  /** Filtre par défaut sur l'année scolaire active — un élève sans dossier « vivant » sur
      l'année choisie n'apparaît pas ; "Toutes les années" (id null) lève ce filtre. */
  anneeScolaireId: number | null = null;

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
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.pageIndex = 0; // Retour à la 1ère page à chaque nouvelle recherche
        this.refresh();
      });
    this.loadClasses();
    this.loadAnnees();
  }

  loadClasses(): void {
    this.classeService.getAll(1, 100).subscribe((res: any) => {
      const list = res.data ?? (Array.isArray(res) ? res : []);
      this.classes = [{ id: null, libelle: 'Toutes les classes', code: '' }, ...list];
    });
  }

  /** Charge les années scolaires et sélectionne l'année active par défaut, puis lance le premier
      chargement des élèves (une fois le filtre par défaut connu, pour éviter un clignotement
      "toutes années" → "année active"). */
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

  onClasseChange(): void {
    this.pageIndex = 0;
    this.refresh();
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

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchSubject.next('');
  }

  refresh(): void {
    this.loading = true;
    // L'API utilise une pagination 1-based
    this.eleveService
      .getAll(this.pageIndex + 1, this.pageSize, this.searchTerm, null, this.classeId, this.anneeScolaireId)
      .subscribe({
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

  isFirstPage(): boolean {
    return this.pageIndex === 0;
  }
  isLastPage(): boolean {
    return this.pageIndex >= this.totalPages - 1;
  }
  getEndIndex(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements);
  }

  /** Liste PDF (imprimable) des élèves de la classe filtrée — nécessite une classe sélectionnée. */
  telechargerListeClasse(): void {
    if (this.classeId == null) {
      this.notification.info('Choisissez d’abord une classe dans le filtre pour générer sa liste.');
      return;
    }
    if (this.exportListeEnCours) return;
    this.exportListeEnCours = true;
    this.eleveService.telechargerListeClassePdf(this.classeId).subscribe({
      next: (blob) => {
        const classe = this.classes.find((c) => c.id === this.classeId) as any;
        const nom = classe?.libelle ?? 'classe';
        this.dialog.open(PdfPreviewDialogComponent, {
          width: '820px',
          maxWidth: '95vw',
          height: '90vh',
          maxHeight: '92vh',
          panelClass: 'professional-dialog',
          data: { blob, filename: `liste-eleves-${nom}.pdf`, title: `Liste des élèves — ${nom}` }
        });
        this.exportListeEnCours = false;
      },
      error: () => {
        this.notification.error('Impossible de générer la liste des élèves');
        this.exportListeEnCours = false;
      }
    });
  }

  openForm(eleve: Eleve): void {
    this.dialog
      .open(EleveFormDialogComponent, {
        width: '700px',
        data: eleve,
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.refresh();
      });
  }

  openDetail(eleve: Eleve): void {
    this.dialog.open(EleveDetailDialogComponent, {
      width: '500px',
      data: eleve,
      panelClass: 'professional-dialog'
    });
  }

}
