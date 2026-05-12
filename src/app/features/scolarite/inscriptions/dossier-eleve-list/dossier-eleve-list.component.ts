import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DossierEleveService } from '../../../../core/services/dossier-eleve.service';
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
import { NbTagModule, NbUserModule } from '@nebular/theme';

@Component({
  selector: 'app-dossier-eleve-list',
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
    MatInputModule, MatFormFieldModule,
    MatProgressSpinnerModule,
    NbTagModule,
    NbUserModule,
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
  templateUrl: './dossier-eleve-list.component.html',
  styleUrl: './dossier-eleve-list.component.scss'
})
export class DossierEleveListComponent implements OnInit, OnDestroy, AfterViewInit {
  private dossierService = inject(DossierEleveService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  displayedColumns: string[] = ['numero', 'eleve', 'classe', 'annee', 'statut', 'actions'];
  dataSource = new MatTableDataSource<DossierEleve>([]);
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

    // Ouvrir le formulaire automatiquement si demandé (depuis le dashboard)
    this.route.queryParams.subscribe(params => {
      if (params['openForm'] === 'true') {
        this.openForm();
      }
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
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  refresh(): void {
    this.loading = true;
    this.dossierService.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        const items = response.data || response;
        this.dataSource.data = items;
        this.totalElements = response.meta?.totalElements || items.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Impossible de charger les dossiers');
        this.loading = false;
      }
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

  getStatusColor(status?: string): string {
    switch (status) {
      case 'VALIDÉ': return 'success';
      case 'PAYÉ': return 'info';
      case 'DÉPOSÉ': return 'warning';
      case 'ANNULÉ': return 'danger';
      default: return 'basic';
    }
  }

  async deleteDossier(dossier: DossierEleve): Promise<void> {
    const confirmed = await this.notification.confirm(`Souhaitez-vous vraiment supprimer le dossier ${dossier.numero} ?`);
    if (confirmed) {
      this.loading = true;
      this.dossierService.delete(dossier.uuid!).subscribe({
        next: () => {
          this.notification.success('Dossier supprimé');
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
