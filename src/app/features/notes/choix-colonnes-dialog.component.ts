import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ColonneChoix {
  type: 'INTERROGATION' | 'DEVOIR';
  numero: number;
  libelle: string;
  choisie: boolean;
}

export interface ChoixColonnesData {
  titre: string;
  sousTitre: string;
  intro: string;
  cta: string;
  colonnes: ColonneChoix[];
}

export interface ChoixColonnesResultat {
  /** Plus grand numéro coché par type — 0 si aucune colonne de ce type n'est cochée. */
  interrogationsJusqua: number;
  devoirsJusqua: number;
}

/** Dialogue générique « choisir des colonnes » — sert à l'envoi par l'enseignant ET à
    l'approbation par l'administration. Le figeage étant contigu (1..N), cocher/décocher une ligne
    aligne les suivantes du même type. Tout est décoché au départ. */
@Component({
  selector: 'app-choix-colonnes-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="ccd">
      <header class="ccd-head">
        <div class="ccd-head-left">
          <div class="ccd-icon"><mat-icon>rule</mat-icon></div>
          <div>
            <h3>{{ data.titre }}</h3>
            <p>{{ data.sousTitre }}</p>
          </div>
        </div>
        <button type="button" class="ccd-close" (click)="annuler()" aria-label="Fermer">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="ccd-body">
        <p class="ccd-intro"><mat-icon>info</mat-icon>{{ data.intro }}</p>

        <div class="ccd-list" *ngIf="data.colonnes.length; else vide">
          <label class="ccd-row" *ngFor="let c of data.colonnes; let i = index" [class.on]="c.choisie">
            <input type="checkbox" [(ngModel)]="c.choisie" (change)="aligner(i)" />
            <span class="ccd-check"><mat-icon>check</mat-icon></span>
            <span class="ccd-label">{{ c.libelle }}</span>
            <span class="ccd-tag" [class.tag-int]="c.type === 'INTERROGATION'" [class.tag-dev]="c.type === 'DEVOIR'">
              {{ c.type === 'INTERROGATION' ? 'Interro' : 'Devoir' }}
            </span>
          </label>
        </div>
        <ng-template #vide><p class="ccd-vide">Aucune colonne concernée.</p></ng-template>
      </div>

      <footer class="ccd-foot">
        <button type="button" class="ccd-btn ghost" (click)="annuler()">Annuler</button>
        <button type="button" class="ccd-btn primary" (click)="confirmer()" [disabled]="!nbChoisies">
          <mat-icon>check</mat-icon>
          {{ data.cta }}<ng-container *ngIf="nbChoisies"> ({{ nbChoisies }})</ng-container>
        </button>
      </footer>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .ccd { display: flex; flex-direction: column; background: #fff; color: #1e293b; font-size: 0.9rem; }

      .ccd-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.2rem; border-bottom: 1px solid #eef1f5; }
      .ccd-head-left { display: flex; align-items: center; gap: 0.75rem; }
      .ccd-icon { flex: 0 0 auto; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
      .ccd-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
      .ccd-head h3 { margin: 0; font-size: 1rem; font-weight: 700; }
      .ccd-head p { margin: 0.1rem 0 0; font-size: 0.78rem; color: #64748b; }
      .ccd-close { border: 0; background: transparent; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
      .ccd-close:hover { background: #f1f5f9; color: #475569; }

      .ccd-body { padding: 1rem 1.2rem; }
      .ccd-intro { display: flex; gap: 0.5rem; margin: 0 0 0.9rem; padding: 0.6rem 0.75rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 9px; font-size: 0.8rem; color: #92400e; line-height: 1.4; }
      .ccd-intro mat-icon { flex: 0 0 auto; font-size: 17px; width: 17px; height: 17px; margin-top: 1px; }

      .ccd-list { display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 11px; overflow: hidden; }
      .ccd-row { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.85rem; cursor: pointer; transition: background 0.12s; }
      .ccd-row + .ccd-row { border-top: 1px solid #f1f5f9; }
      .ccd-row:hover { background: #f8fafc; }
      .ccd-row.on { background: #fff7ed; }
      .ccd-row input { position: absolute; opacity: 0; pointer-events: none; }

      .ccd-check { flex: 0 0 auto; width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid #cbd5e1; display: flex; align-items: center; justify-content: center; background: #fff; transition: all 0.12s; }
      .ccd-check mat-icon { font-size: 15px; width: 15px; height: 15px; color: #fff; opacity: 0; }
      .ccd-row.on .ccd-check { background: #d97706; border-color: #d97706; }
      .ccd-row.on .ccd-check mat-icon { opacity: 1; }

      .ccd-label { flex: 1 1 auto; font-weight: 500; }
      .ccd-tag { flex: 0 0 auto; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; padding: 0.12rem 0.5rem; border-radius: 999px; }
      .tag-int { background: #e0e7ff; color: #4338ca; }
      .tag-dev { background: #dcfce7; color: #15803d; }
      .ccd-vide { margin: 0; padding: 0.9rem; text-align: center; color: #94a3b8; font-size: 0.85rem; }

      .ccd-foot { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.9rem 1.2rem; border-top: 1px solid #eef1f5; background: #fafbfc; }
      .ccd-btn { display: inline-flex; align-items: center; gap: 0.35rem; border: 0; border-radius: 9px; padding: 0.55rem 1rem; font-size: 0.86rem; font-weight: 600; cursor: pointer; transition: all 0.12s; }
      .ccd-btn mat-icon { font-size: 17px; width: 17px; height: 17px; }
      .ccd-btn.ghost { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
      .ccd-btn.ghost:hover { background: #f1f5f9; }
      .ccd-btn.primary { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
      .ccd-btn.primary:hover { filter: brightness(1.05); }
      .ccd-btn.primary:disabled { opacity: 0.45; cursor: default; filter: none; }
    `
  ]
})
export class ChoixColonnesDialogComponent {
  private dialogRef = inject(MatDialogRef<ChoixColonnesDialogComponent>);
  data = inject<ChoixColonnesData>(MAT_DIALOG_DATA);

  aligner(index: number): void {
    const ref = this.data.colonnes[index];
    this.data.colonnes.forEach((c, i) => {
      if (c.type !== ref.type) return;
      if (ref.choisie && i < index) c.choisie = true;
      if (!ref.choisie && i > index) c.choisie = false;
    });
  }

  get nbChoisies(): number {
    return this.data.colonnes.filter((c) => c.choisie).length;
  }

  annuler(): void {
    this.dialogRef.close(null);
  }

  confirmer(): void {
    const maxType = (t: 'INTERROGATION' | 'DEVOIR') =>
      this.data.colonnes.filter((c) => c.type === t && c.choisie).reduce((m, c) => Math.max(m, c.numero), 0);
    const res: ChoixColonnesResultat = {
      interrogationsJusqua: maxType('INTERROGATION'),
      devoirsJusqua: maxType('DEVOIR')
    };
    this.dialogRef.close(res);
  }
}
