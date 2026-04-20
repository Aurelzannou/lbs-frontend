export interface CategorieDepense {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  actif?: boolean;
}

export interface CategorieDepenseRequest {
  code: string;
  libelle: string;
  actif?: boolean;
}
