export interface PeriodeInscription {
  id?: number;
  uuid?: string;
  libelle?: string;
  anneeScolaireId: number;
  anneeScolaireLibelle?: string;
  dateOuverture: string;
  dateCloture: string;
  actif?: boolean;
  statut?: 'OUVERT' | 'A_VENIR' | 'CLOTURE' | 'INACTIF';
}

export interface PeriodeInscriptionRequest {
  anneeScolaireId: number;
  libelle?: string;
  dateOuverture: string;
  dateCloture: string;
  actif?: boolean;
}
