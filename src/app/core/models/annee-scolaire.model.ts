export interface AnneeScolaire {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  dateDebut?: string;
  dateFin?: string;
  actif?: boolean;
}

export interface AnneeScolaireRequest {
  code: string;
  libelle: string;
  dateDebut?: string;
  dateFin?: string;
  actif?: boolean;
}
