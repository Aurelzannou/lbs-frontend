import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EleveNoteDto } from '../../../core/models/note.model';

@Component({
  selector: 'app-notes-roster-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './notes-roster-table.component.html',
  styleUrl: './notes-roster-table.component.scss'
})
export class NotesRosterTableComponent {
  @Input() eleves: EleveNoteDto[] = [];
  @Input() readonly = false;

  recherche = '';

  get elevesFiltres(): EleveNoteDto[] {
    if (!this.recherche.trim()) return this.eleves;
    const terme = this.recherche.trim().toLowerCase();
    return this.eleves.filter(
      (e) => e.nom.toLowerCase().includes(terme) || e.prenom.toLowerCase().includes(terme)
    );
  }

  calculerMoyenne(el: EleveNoteDto): number | null {
    const valeurs = [el.interrogation, el.devoir1, el.devoir2].filter(
      (v): v is number => v !== null && v !== undefined
    );
    if (valeurs.length === 0) return null;
    return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
  }

  onValeurChange(el: EleveNoteDto): void {
    el.moyenne = this.calculerMoyenne(el);
  }
}
