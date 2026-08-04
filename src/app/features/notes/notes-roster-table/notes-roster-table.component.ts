import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EleveNoteDto } from '../../../core/models/note.model';

@Component({
  selector: 'app-notes-roster-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './notes-roster-table.component.html',
  styleUrl: './notes-roster-table.component.scss'
})
export class NotesRosterTableComponent implements OnChanges {
  @Input() eleves: EleveNoteDto[] = [];
  @Input() nombreInterrogations = 1;
  @Input() readonly = false;
  @Output() nombreInterrogationsChange = new EventEmitter<number>();

  recherche = '';

  ngOnChanges(): void {
    this.assurerTaillesInterrogations();
  }

  get interrogationIndices(): number[] {
    return Array.from({ length: this.nombreInterrogations }, (_, i) => i);
  }

  get elevesFiltres(): EleveNoteDto[] {
    if (!this.recherche.trim()) return this.eleves;
    const terme = this.recherche.trim().toLowerCase();
    return this.eleves.filter(
      (e) => e.nom.toLowerCase().includes(terme) || e.prenom.toLowerCase().includes(terme)
    );
  }

  private assurerTaillesInterrogations(): void {
    for (const el of this.eleves) {
      if (!el.interrogations) el.interrogations = [];
      while (el.interrogations.length < this.nombreInterrogations) {
        el.interrogations.push(null);
      }
    }
  }

  readonly maxInterrogations = 4;

  ajouterInterrogation(): void {
    if (this.nombreInterrogations >= this.maxInterrogations) return;
    this.nombreInterrogations++;
    this.assurerTaillesInterrogations();
    this.nombreInterrogationsChange.emit(this.nombreInterrogations);
  }

  supprimerDerniereInterrogation(): void {
    if (this.nombreInterrogations <= 1) return;
    this.nombreInterrogations--;
    for (const el of this.eleves) {
      el.interrogations.length = this.nombreInterrogations;
      el.moyenneInterrogations = this.calculerMoyenneInterrogations(el);
      el.moyenne = this.calculerMoyenne(el);
    }
    this.nombreInterrogationsChange.emit(this.nombreInterrogations);
  }

  calculerMoyenneInterrogations(el: EleveNoteDto): number | null {
    const valeurs = (el.interrogations || []).filter((v): v is number => v !== null && v !== undefined);
    if (valeurs.length === 0) return null;
    return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
  }

  calculerMoyenne(el: EleveNoteDto): number | null {
    const moyInterro = this.calculerMoyenneInterrogations(el);
    const valeurs = [moyInterro, el.devoir1, el.devoir2].filter(
      (v): v is number => v !== null && v !== undefined
    );
    if (valeurs.length === 0) return null;
    return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
  }

  private clamp(valeur: number | null | undefined): number | null {
    if (valeur === null || valeur === undefined || isNaN(valeur)) return valeur ?? null;
    return Math.min(20, Math.max(0, valeur));
  }

  onValeurChange(el: EleveNoteDto): void {
    el.devoir1 = this.clamp(el.devoir1);
    el.devoir2 = this.clamp(el.devoir2);
    if (el.interrogations) {
      el.interrogations = el.interrogations.map((v) => this.clamp(v));
    }
    el.moyenneInterrogations = this.calculerMoyenneInterrogations(el);
    el.moyenne = this.calculerMoyenne(el);
  }
}
