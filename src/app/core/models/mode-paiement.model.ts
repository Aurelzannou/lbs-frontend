export interface ModePaiement {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  actif?: boolean;
}

export interface ModePaiementRequest {
  code: string;
  libelle: string;
  actif?: boolean;
}
