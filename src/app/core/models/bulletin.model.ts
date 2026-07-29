export interface BulletinMatiere {
  matiereId: number;
  matiereLibelle: string;
  coefficient?: number | null;
  interrogation?: number | null;
  devoir1?: number | null;
  devoir2?: number | null;
  moyenne?: number | null;
  moyenneCoefficientee?: number | null;
  rang?: number | null;
  appreciation?: string | null;
}

export interface Bulletin {
  eleveId: number;
  eleveNomComplet: string;
  classeId: number;
  classeLibelle: string;
  effectifClasse: number;
  periodeId: number;
  periodeLibelle: string;
  anneeScolaireLibelle?: string;
  matieres: BulletinMatiere[];
  moyennePonderee?: number | null;
  rangTrimestre?: number | null;
  moyenneAnnuelle?: number | null;
  rangAnnuel?: number | null;
  tableauHonneur?: boolean;
  felicitations?: boolean;
  encouragement?: boolean;
  avertissement?: boolean;
  decisionConseil?: string;
  observationDirecteur?: string;
  suggestionFelicitations: boolean;
  suggestionTableauHonneur: boolean;
  suggestionAvertissement: boolean;
}

export interface BulletinMentionRequest {
  tableauHonneur?: boolean;
  felicitations?: boolean;
  encouragement?: boolean;
  avertissement?: boolean;
  decisionConseil?: string;
  observationDirecteur?: string;
}
