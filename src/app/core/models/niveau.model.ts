export interface Niveau {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  modifierLe?: string;
  modifierPar?: string;
}

export interface NiveauRequest {
  code: string;
  libelle: string;
}
