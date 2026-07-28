import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PeriodeInscription } from '../../../../core/models/periode-inscription.model';
import { PeriodeInscriptionService } from '../../../../core/services/periode-inscription.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PeriodeInscriptionFormDialogComponent } from '../periode-inscription-form-dialog/periode-inscription-form-dialog.component';

@Component({
  selector: 'app-periode-inscription-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  animations: [
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ opacity: '0', transform: 'translateX(-20px)' }),
        animate('0.3s ease-out', style({ opacity: '1', transform: 'translateX(0)' }))
      ])
    ])
  ],
  templateUrl: './periode-inscription-list.component.html',
  styleUrl: './periode-inscription-list.component.scss'
})
export class PeriodeInscriptionListComponent implements OnInit, AfterViewInit, OnDestroy {
  private service = inject(PeriodeInscriptionService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns = [
    'annee',
    'libelle',
    'dateOuverture',
    'dateCloture',
    'statut',
    'actif',
    'actions'
  ];
  dataSource = new MatTableDataSource<PeriodeInscription>([]);
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
    this.searchSub?.unsubscribe();
  }

  onSearchChange(e: Event): void {
    this.searchSubject.next((e.target as HTMLInputElement).value);
  }
  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchSubject.next('');
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }
  getEndIndex(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements);
  }
  isFirstPage(): boolean {
    return this.pageIndex === 0;
  }
  isLastPage(): boolean {
    return this.pageIndex >= this.totalPages - 1;
  }
  prevPage(): void {
    if (!this.isFirstPage()) {
      this.pageIndex--;
      this.refresh();
    }
  }
  nextPage(): void {
    if (!this.isLastPage()) {
      this.pageIndex++;
      this.refresh();
    }
  }

  refresh(): void {
    this.loading = true;
    this.service.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (res: any) => {
        const items = res.data?.content || res.data || (Array.isArray(res) ? res : []);
        const meta = res.meta || {};
        this.totalElements = meta.totalElements || meta.total || items.length;
        this.dataSource.data = items;
        if (this.paginator) {
          this.paginator.length = this.totalElements;
          this.paginator.pageIndex = this.pageIndex;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Impossible de charger les périodes');
        this.loading = false;
      }
    });
  }

  openForm(periode?: PeriodeInscription): void {
    this.dialog
      .open(PeriodeInscriptionFormDialogComponent, {
        width: '520px',
        maxWidth: '95vw',
        data: periode,
        panelClass: 'professional-dialog'
      })
      .afterClosed()
      .subscribe((r) => {
        if (r) this.refresh();
      });
  }

  async deletePeriode(p: PeriodeInscription): Promise<void> {
    const ok = await this.notification.confirm(
      `Supprimer la période "${p.libelle || p.anneeScolaireLibelle}" ?`
    );
    if (!ok) return;
    this.service.delete(p.uuid!).subscribe({
      next: () => {
        this.notification.success('Période supprimée');
        this.refresh();
      },
      error: () => this.notification.error('Erreur lors de la suppression')
    });
  }
}
