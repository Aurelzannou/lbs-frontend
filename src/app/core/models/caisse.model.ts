export interface Caisse {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  solde?: number;
  actif?: boolean;
}

export interface CaisseRequest {
  code: string;
  libelle: string;
  solde?: number;
  actif?: boolean;
}
