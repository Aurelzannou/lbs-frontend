import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { NiveauService } from '../../../core/services/niveau.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Niveau } from '../../../core/models/niveau.model';
import { NiveauFormDialogComponent } from '../niveau-form-dialog/niveau-form-dialog.component';

@Component({
  selector: 'app-niveau-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule,
    MatCardModule
  ],
  template: `
    <div class="page-container">
      <header class="header">
        <div class="title-section">
          <h1>Niveaux Scolaires</h1>
          <p>Gérez les différents niveaux d'enseignement de l'établissement</p>
        </div>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Nouveau Niveau
        </button>
      </header>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource" matSort>
          
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Code </th>
            <td mat-cell *matCellDef="let element"> {{element.code}} </td>
          </ng-container>

          <ng-container matColumnDef="libelle">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Libellé </th>
            <td mat-cell *matCellDef="let element"> {{element.libelle}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-icon-button color="primary" (click)="openForm(element)" title="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteNiveau(element)" title="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucun niveau trouvé.
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: `
    .page-container {
      padding: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      font-size: 1.8rem;
    }
    .header p {
      margin: 4px 0 0;
      color: #777;
    }
    .table-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      background: white;
    }
    table {
      width: 100%;
    }
    .actions-header {
      text-align: center;
    }
    .actions-cell {
      text-align: center;
      white-space: nowrap;
    }
    .no-data {
      padding: 40px;
      text-align: center;
      color: #999;
    }
  `
})
export class NiveauListComponent implements OnInit {
  private niveauService = inject(NiveauService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['code', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Niveau>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.niveauService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => this.notification.error('Impossible de charger les niveaux')
    });
  }

  openForm(niveau?: Niveau): void {
    const dialogRef = this.dialog.open(NiveauFormDialogComponent, {
      width: '400px',
      data: niveau
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  deleteNiveau(niveau: Niveau): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le niveau "${niveau.libelle}" ?`)) {
      this.niveauService.delete(niveau.uuid!).subscribe({
        next: () => {
          this.notification.success('Niveau supprimé avec succès');
          this.refresh();
        },
        error: () => this.notification.error('Erreur lors de la suppression')
      });
    }
  }
}
