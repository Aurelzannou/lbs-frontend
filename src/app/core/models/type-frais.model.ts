export interface TypeFrais {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  obligatoire?: boolean;
  actif?: boolean;
}

export interface TypeFraisRequest {
  code: string;
  libelle: string;
  obligatoire?: boolean;
  actif?: boolean;
}
