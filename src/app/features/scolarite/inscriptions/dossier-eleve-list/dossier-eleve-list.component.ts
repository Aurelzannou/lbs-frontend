import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DossierEleveService } from '../../../../core/services/dossier-eleve.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DossierEleve } from '../../../../core/models/dossier-eleve.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { DossierEleveFormDialogComponent } from '../dossier-eleve-form-dialog/dossier-eleve-form-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dossier-eleve-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatInputModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  animations: [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-20px)', 'box-shadow': 'none' }),
        animate('0.3s ease-out', style({ height: '*', opacity: '1', transform: 'translateX(0)' }))
      ])
    ])
  ],
  templateUrl: './dossier-eleve-list.component.html',
  styleUrl: './dossier-eleve-list.component.scss'
})
export class DossierEleveListComponent implements OnInit, OnDestroy, AfterViewInit {
  private dossierService    = inject(DossierEleveService);
  private validationService = inject(ValidationService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  displayedColumns: string[] = ['numero', 'eleve', 'classe', 'annee', 'statut', 'actions'];
  dataSource = new MatTableDataSource<DossierEleve>([]);
  allDossiers: DossierEleve[] = [];
  loading = false;
  activeStatut = 'ALL';

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

    this.route.queryParams.subscribe(params => {
      if (params['openForm'] === 'true') this.openForm();
    });
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
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  refresh(): void {
    this.loading = true;
    this.dossierService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        const page = response.data ?? response;
        const items = page.data ?? (Array.isArray(page) ? page : []);
        this.allDossiers = items;
        this.applyFilter();
        this.totalElements = page.meta?.totalElements ?? items.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Impossible de charger les dossiers');
        this.loading = false;
      }
    });
  }

  filterByStatut(statut: string): void {
    this.activeStatut = statut;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeStatut === 'ALL') {
      this.dataSource.data = this.allDossiers;
    } else {
      this.dataSource.data = this.allDossiers.filter(d => {
        const code = d.statutCode || d.statut?.code || '';
        return code === this.activeStatut;
      });
    }
  }

  countByStatut(statut: string): number {
    return this.allDossiers.filter(d => {
      const code = d.statutCode || d.statut?.code || '';
      return code === statut;
    }).length;
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      'DEPOSE': 'st-depose',
      'EN_ATTENTE': 'st-attente',
      'ACCEPTE': 'st-accepte',
      'REFUSE': 'st-refuse',
      'INSCRIT': 'st-inscrit',
      'ANNULE': 'st-annule'
    };
    return map[code] || 'st-default';
  }

  canAccept(row: any): boolean {
    const code = row.statutCode || row.statut?.code || '';
    return ['DEPOSE', 'EN_ATTENTE'].includes(code);
  }

  canRefuse(row: any): boolean {
    const code = row.statutCode || row.statut?.code || '';
    return ['DEPOSE', 'EN_ATTENTE', 'ACCEPTE'].includes(code);
  }

  canInscrire(row: any): boolean {
    const code = row.statutCode || row.statut?.code || '';
    return code === 'ACCEPTE';
  }

  async changerStatut(dossier: DossierEleve, statut: string): Promise<void> {
    const labels: Record<string, string> = {
      ACCEPTE: 'accepter', REFUSE: 'refuser', INSCRIT: 'marquer comme inscrit'
    };
    const confirmed = await this.notification.confirm(
      `Voulez-vous vraiment ${labels[statut] || statut} ce dossier ?`
    );
    if (!confirmed) return;

    const action$ = statut === 'ACCEPTE' ? this.validationService.accepter(dossier.uuid!)
                  : statut === 'REFUSE'  ? this.validationService.refuser(dossier.uuid!)
                  : this.validationService.inscrire(dossier.uuid!);
    action$.subscribe({
      next: () => {
        this.notification.success('Statut mis à jour avec succès');
        this.refresh();
      },
      error: () => this.notification.error('Erreur lors du changement de statut')
    });
  }

  openForm(dossier?: DossierEleve): void {
    this.dialog.open(DossierEleveFormDialogComponent, {
      width: '800px',
      data: dossier,
      panelClass: 'professional-dialog'
    }).afterClosed().subscribe(result => {
      if (result) this.refresh();
    });
  }

  async deleteDossier(dossier: DossierEleve): Promise<void> {
    const confirmed = await this.notification.confirm(
      `Souhaitez-vous vraiment supprimer le dossier ${dossier.numero} ?`
    );
    if (confirmed) {
      this.loading = true;
      this.dossierService.delete(dossier.uuid!).subscribe({
        next: () => { this.notification.success('Dossier supprimé'); this.refresh(); },
        error: () => { this.notification.error('Erreur lors de la suppression'); this.loading = false; }
      });
    }
  }

  get totalPages(): number { return Math.ceil(this.totalElements / this.pageSize) || 1; }
  isFirstPage(): boolean { return this.pageIndex === 0; }
  isLastPage(): boolean { return this.pageIndex >= this.totalPages - 1; }
  getEndIndex(): number { return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements); }
  nextPage(): void { if (!this.isLastPage()) { this.pageIndex++; this.refresh(); } }
  prevPage(): void { if (!this.isFirstPage()) { this.pageIndex--; this.refresh(); } }
}
