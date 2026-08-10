export interface EleveNoteDto {
  eleveId: number;
  nom: string;
  prenom: string;
  interrogations: (number | null)[];
  devoir1?: number | null;
  devoir2?: number | null;
  moyenneInterrogations?: number | null;
  moyenne?: number | null;
}

export interface FeuilleSaisieNotes {
  classeId: number;
  classeLibelle: string;
  matiereId: number;
  matiereLibelle: string;
  periodeId: number;
  periodeLibelle: string;
  valide: boolean;
  nombreInterrogations: number;
  /** Matière "Conduite" — moyenne = valeur unique (Interrogation 1), pas de /3. */
  estConduite?: boolean;
  eleves: EleveNoteDto[];
}

export interface EleveNoteEntry {
  eleveId: number;
  interrogations?: (number | null)[];
  devoir1?: number | null;
  devoir2?: number | null;
}

export interface FeuilleSaisieNotesRequest {
  classeId: number;
  matiereId: number;
  periodeId: number;
  professeurId?: number | null;
  eleves: EleveNoteEntry[];
}

export interface ClasseMatiereANoter {
  classeId: number;
  classeLibelle: string;
  matiereId: number;
  matiereLibelle: string;
}

export type EtapeSaisieNotes = 'BROUILLON' | 'SOUMISE' | 'VALIDEE';

export interface ProgressionSaisieNotes {
  classeId: number;
  matiereId: number;
  periodeId: number;
  interrogationsVerroueesJusqua: number;
  devoirsVerrouesJusqua: number;
  interrogationsValideesJusqua: number;
  devoirsValideesJusqua: number;
  etape: EtapeSaisieNotes;
  dateSoumission: string | null;
  dateValidation: string | null;
  valideParEmail: string | null;
}

export interface VerrouProgressionRequest {
  classeId: number;
  matiereId: number;
  periodeId: number;
  typeEvaluation: 'INTERROGATION' | 'DEVOIR';
  numero: number;
}

export interface ProgressionMatiereRequest {
  classeId: number;
  matiereId: number;
  periodeId: number;
}

export interface ProgressionEtapeHistorique {
  etape: EtapeSaisieNotes;
  etapeLibelle: string;
  dateTransition: string;
  auteurEmail: string | null;
}
