export interface Matiere {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  actif?: boolean;
  /** Matière "Conduite" — moyenne = valeur unique (pas de /3), suggestion auto (18 - absences). */
  estConduite?: boolean;
}

export interface MatiereRequest {
  code: string;
  libelle: string;
  actif?: boolean;
  estConduite?: boolean;
}
