import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbIconModule, 
  NbToastrService,
  NbTooltipModule
} from '@nebular/theme';
import { MenuService, MenuResponse } from '../../../core/services/menu.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MenuFormDialogComponent } from './menu-form-dialog/menu-form-dialog.component';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    MatDialogModule
  ],
  template: `
    <nb-card>
      <nb-card-header class="header-container">
        <div class="title-section">
          <h2>Gestion des Menus</h2>
          <p class="subtitle">Configurez la navigation de l'application</p>
        </div>
        <button nbButton status="primary" (click)="addMenu()">
          <nb-icon icon="plus-outline"></nb-icon> NOUVEAU MENU
        </button>
      </nb-card-header>
      
      <nb-card-body>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Icône</th>
                <th>Titre</th>
                <th>Code</th>
                <th>Path</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let menu of allMenus">
                <td>{{ menu.ordre }}</td>
                <td><nb-icon [icon]="getIconFor(menu.code)"></nb-icon></td>
                <td>{{ menu.titre }}</td>
                <td><span class="code-badge">{{ menu.code }}</span></td>
                <td><code>{{ menu.path }}</code></td>
                <td>
                  <div class="action-buttons">
                    <button nbButton ghost status="info" size="small" (click)="editMenu(menu)" nbTooltip="Modifier">
                      <nb-icon icon="edit-2-outline"></nb-icon>
                    </button>
                    <button nbButton ghost status="danger" size="small" (click)="deleteMenu(menu)" nbTooltip="Supprimer">
                      <nb-icon icon="trash-2-outline"></nb-icon>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="allMenus.length === 0">
                <td colspan="6" class="no-data">Aucun menu trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
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
    code {
      background-color: #f7f9fc;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: monospace;
      font-size: 0.9rem;
    }
  `]
})
export class MenuListComponent implements OnInit {
  allMenus: MenuResponse[] = [];

  constructor(
    private menuService: MenuService,
    private toastrService: NbToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllMenus();
  }

  loadAllMenus(): void {
    this.menuService.getAll().subscribe({
      next: (data) => {
        this.allMenus = data; 
      },
      error: (err) => {
        console.error('Erreur chargement menus:', err);
        this.toastrService.danger('Impossible de charger les menus', 'Erreur');
      }
    });
  }

  getIconFor(code: string): string {
    return this.menuService.getIconByCode(code);
  }

  addMenu(): void {
    this.dialog.open(MenuFormDialogComponent, {
      width: '550px'
    }).afterClosed().subscribe(result => {
      if (result) this.loadAllMenus();
    });
  }

  editMenu(menu: MenuResponse): void {
    this.dialog.open(MenuFormDialogComponent, {
      width: '550px',
      data: menu
    }).afterClosed().subscribe(result => {
      if (result) this.loadAllMenus();
    });
  }

  deleteMenu(menu: MenuResponse): void {
    if (confirm(`Supprimer le menu ${menu.titre} ?`)) {
      this.menuService.delete(menu.id).subscribe({
        next: () => {
          this.toastrService.success('Menu supprimé', 'Succès');
          this.loadAllMenus();
        },
        error: () => this.toastrService.danger('Erreur suppression', 'Erreur')
      });
    }
  }
}
