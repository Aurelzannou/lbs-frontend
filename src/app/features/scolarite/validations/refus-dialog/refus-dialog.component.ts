import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-refus-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatIconModule],
  template: `
    <div class="refus-dialog">
      <div class="refus-header">
        <mat-icon class="refus-icon">cancel</mat-icon>
        <div>
          <h3>Refuser le dossier</h3>
          <p>{{ data.numero }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>
      <div class="refus-body">
        <mat-form-field appearance="outline" style="width:100%">
          <mat-label>Motif de refus (optionnel)</mat-label>
          <textarea matInput [(ngModel)]="motif" rows="4"
            placeholder="Ex: Documents incomplets, dossier hors délai..."></textarea>
        </mat-form-field>
      </div>
      <div class="refus-footer">
        <button mat-button (click)="dialogRef.close()">Annuler</button>
        <button mat-flat-button color="warn" (click)="confirmer()">Confirmer le refus</button>
      </div>
    </div>
  `,
  styles: [`
    .refus-dialog { padding: 0; min-width: 440px; }
    .refus-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 24px; border-bottom: 1px solid #fee2e2; background: #fff5f5;
      h3 { margin: 0; font-size: 16px; color: #991b1b; }
      p  { margin: 2px 0 0; font-size: 12px; color: #64748b; font-family: monospace; }
      button { margin-left: auto; }
    }
    .refus-icon { color: #dc2626; font-size: 28px; width: 28px; height: 28px; }
    .refus-body { padding: 20px 24px; }
    .refus-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 12px 24px; border-top: 1px solid #f1f5f9;
    }
  `]
})
export class RefusDialogComponent {
  motif = '';

  constructor(
    public dialogRef: MatDialogRef<RefusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { numero: string }
  ) {}

  confirmer(): void {
    this.dialogRef.close(this.motif || undefined);
  }
}
