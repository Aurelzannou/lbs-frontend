export interface EleveNoteDto {
  eleveId: number;
  nom: string;
  prenom: string;
  interrogation?: number | null;
  devoir1?: number | null;
  devoir2?: number | null;
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
  eleves: EleveNoteDto[];
}

export interface EleveNoteEntry {
  eleveId: number;
  interrogation?: number | null;
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
