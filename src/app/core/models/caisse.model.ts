export interface Caisse {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  solde?: number;
  actif?: boolean;
  utilisateurId?: number | null;
  utilisateurNomComplet?: string | null;
}

export interface CaisseRequest {
  code: string;
  libelle: string;
  solde?: number;
  actif?: boolean;
  utilisateurId?: number | null;
}
