import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface PdfPreviewDialogData {
  blob: Blob;
  filename: string;
  title: string;
}

@Component({
  selector: 'app-pdf-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './pdf-preview-dialog.component.html',
  styleUrl: './pdf-preview-dialog.component.scss'
})
export class PdfPreviewDialogComponent implements OnDestroy {
  private dialogRef = inject(MatDialogRef<PdfPreviewDialogComponent>);
  private sanitizer = inject(DomSanitizer);
  public data = inject<PdfPreviewDialogData>(MAT_DIALOG_DATA);

  private objectUrl = URL.createObjectURL(this.data.blob);
  // "#view=FitH" demande à la visionneuse PDF du navigateur d'ajuster la page à la largeur
  // disponible au lieu de l'afficher en petit dans un coin à son zoom par défaut.
  safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.objectUrl}#view=FitH`);

  telecharger(): void {
    const a = document.createElement('a');
    a.href = this.objectUrl;
    a.download = this.data.filename;
    a.click();
  }

  fermer(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.objectUrl);
  }
}
