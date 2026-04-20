export interface Matiere {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  actif?: boolean;
}

export interface MatiereRequest {
  code: string;
  libelle: string;
  actif?: boolean;
}
