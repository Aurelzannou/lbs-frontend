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
  @Input() allowAddInterrogation = true;
  @Output() nombreInterrogationsChange = new EventEmitter<number>();

  // Verrouillage colonne par colonne (professeur uniquement) — laisser à `null` désactive
  // complètement cette restriction (utilisé par les écrans admin, qui gardent l'édition libre).
  @Input() progressionInterrogations: number | null = null;
  @Input() progressionDevoirs: number | null = null;
  // Validation admin par colonne — la colonne N+1 ne peut être verrouillée par le professeur que
  // si la colonne N a déjà été validée par l'admin (sauf pour la toute première colonne).
  @Input() progressionInterrogationsValidees = 0;
  @Input() progressionDevoirsValidees = 0;
  @Input() verrouillageEnCours = false;
  // Côté admin, on veut afficher les couleurs/icônes de verrouillage sans jamais bloquer l'édition
  // ni proposer le bouton "Terminer" (réservé au professeur) — mettre à false désactive ces deux
  // effets tout en gardant les getters *Verrouillee/*Valide/*EnAttente actifs pour le style visuel.
  @Input() verrouillageActifPourEdition = true;
  @Output() verrouillerInterrogation = new EventEmitter<number>();
  @Output() verrouillerDevoir = new EventEmitter<number>();
  // Émis à chaque valeur saisie (débounce/auto-save gérés par l'écran parent) — pour ne jamais
  // perdre une note en cas de coupure avant que l'utilisateur ne pense à cliquer "Enregistrer".
  @Output() valeurModifiee = new EventEmitter<void>();

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

  /** La dernière colonne d'interrogation ne peut être retirée que si aucun élève n'y a de note
      saisie — sinon on perdrait silencieusement des notes déjà enregistrées. */
  get derniereInterrogationRemplie(): boolean {
    const dernierIndex = this.nombreInterrogations - 1;
    return this.eleves.some((el) => {
      const v = el.interrogations?.[dernierIndex];
      return v !== null && v !== undefined;
    });
  }

  supprimerDerniereInterrogation(): void {
    if (
      this.nombreInterrogations <= 1 ||
      this.derniereInterrogationRemplie ||
      this.interrogationVerrouillee(this.nombreInterrogations)
    ) {
      return;
    }
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

  /** Lit la valeur brute tapée par l'utilisateur, accepte la virgule comme séparateur décimal
      (usage français — un <input type="number"> natif la rejette selon la locale du navigateur, ce
      qui cassait la saisie de valeurs comme "3,50" : la virgule était ignorée et les chiffres se
      concaténaient en "350", plafonné à tort à 20) et plafonne la valeur à 20 (barème d'une note).
      On écrit directement dans le modèle et, si la saisie a été filtrée/corrigée, on resynchronise
      aussi le DOM (input en <input type="text"> + contrôle manuel plutôt que ngModel, pour garder
      une maîtrise totale et instantanée sur ce qui est accepté). */
  private parserEtClamper(input: HTMLInputElement): number | null {
    let brut = input.value.replace(/[^0-9.,]/g, '');
    const premierSeparateur = brut.search(/[.,]/);
    if (premierSeparateur !== -1) {
      brut = brut.slice(0, premierSeparateur + 1) + brut.slice(premierSeparateur + 1).replace(/[.,]/g, '');
    }
    if (brut !== input.value) input.value = brut;

    if (brut.trim() === '' || brut === '.' || brut === ',') return null;
    const valeur = parseFloat(brut.replace(',', '.'));
    if (isNaN(valeur)) return null;
    const clampee = this.clamp(valeur);
    if (clampee !== valeur) {
      input.value = clampee === null ? '' : String(clampee);
    }
    return clampee;
  }

  onSaisieInterrogation(el: EleveNoteDto, index: number, event: Event): void {
    el.interrogations[index] = this.parserEtClamper(event.target as HTMLInputElement);
    el.moyenneInterrogations = this.calculerMoyenneInterrogations(el);
    el.moyenne = this.calculerMoyenne(el);
    this.valeurModifiee.emit();
  }

  onSaisieDevoir(el: EleveNoteDto, numero: 1 | 2, event: Event): void {
    const valeur = this.parserEtClamper(event.target as HTMLInputElement);
    if (numero === 1) el.devoir1 = valeur;
    else el.devoir2 = valeur;
    el.moyenneInterrogations = this.calculerMoyenneInterrogations(el);
    el.moyenne = this.calculerMoyenne(el);
    this.valeurModifiee.emit();
  }

  // ── Verrouillage colonne par colonne ──────────────────────────────────

  get progressionActive(): boolean {
    return this.progressionInterrogations !== null;
  }

  /** Professeur : seule la colonne immédiatement suivante à celle déjà verrouillée est éditable,
      et seulement si la précédente est validée par l'admin. Admin : toute colonne non encore
      validée reste modifiable (même verrouillée par le professeur, pour pouvoir la corriger avant
      de la valider) — une fois validée, même l'admin doit d'abord "Déverrouiller" pour y retoucher. */
  interrogationEditable(numero: number): boolean {
    if (!this.progressionActive) return true;
    if (this.verrouillageActifPourEdition) {
      return numero === (this.progressionInterrogations as number) + 1 && this.peutVerrouillerInterrogation(numero);
    }
    return !this.interrogationValidee(numero);
  }

  /** Position seule (sans tenir compte de la validation admin) — sert à décider si le bouton
      "Terminer" doit apparaître (même désactivé, avec une infobulle expliquant pourquoi). */
  interrogationEstProchaine(numero: number): boolean {
    return this.progressionActive && numero === (this.progressionInterrogations as number) + 1;
  }

  interrogationVerrouillee(numero: number): boolean {
    return this.progressionActive && numero <= (this.progressionInterrogations as number);
  }

  interrogationEnAttente(numero: number): boolean {
    return this.progressionActive && numero > (this.progressionInterrogations as number) + 1;
  }

  interrogationValidee(numero: number): boolean {
    return numero <= this.progressionInterrogationsValidees;
  }

  /** Verrouillée par le professeur mais pas encore validée par l'admin — bloque la colonne
      suivante. */
  interrogationEnAttenteValidation(numero: number): boolean {
    return this.interrogationVerrouillee(numero) && !this.interrogationValidee(numero);
  }

  /** La colonne active peut être verrouillée seulement si la précédente est déjà validée par
      l'admin (ou si c'est la toute première colonne). */
  peutVerrouillerInterrogation(numero: number): boolean {
    return numero === 1 || this.progressionInterrogationsValidees >= numero - 1;
  }

  devoirEditable(numero: number): boolean {
    if (this.progressionDevoirs === null) return true;
    if (this.verrouillageActifPourEdition) {
      return numero === this.progressionDevoirs + 1 && this.peutVerrouillerDevoir(numero);
    }
    return !this.devoirValide(numero);
  }

  devoirEstProchain(numero: number): boolean {
    return this.progressionDevoirs !== null && numero === this.progressionDevoirs + 1;
  }

  devoirVerrouille(numero: number): boolean {
    return this.progressionDevoirs !== null && numero <= this.progressionDevoirs;
  }

  devoirEnAttente(numero: number): boolean {
    return this.progressionDevoirs !== null && numero > this.progressionDevoirs + 1;
  }

  devoirValide(numero: number): boolean {
    return numero <= this.progressionDevoirsValidees;
  }

  devoirEnAttenteValidation(numero: number): boolean {
    return this.devoirVerrouille(numero) && !this.devoirValide(numero);
  }

  peutVerrouillerDevoir(numero: number): boolean {
    return numero === 1 || this.progressionDevoirsValidees >= numero - 1;
  }

  onVerrouillerInterrogation(numero: number): void {
    this.verrouillerInterrogation.emit(numero);
  }

  onVerrouillerDevoir(numero: number): void {
    this.verrouillerDevoir.emit(numero);
  }
}
