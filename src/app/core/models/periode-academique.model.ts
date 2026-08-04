import { AnneeScolaire } from './annee-scolaire.model';

export interface PeriodeAcademique {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  anneeScolaireId: number;
  anneeScolaire?: AnneeScolaire;
  dateDebut?: string;
  dateFin?: string;
  verrouille?: boolean;
  statut?: 'A_VENIR' | 'EN_COURS' | 'TERMINEE';
}

export interface PeriodeAcademiqueRequest {
  code: string;
  libelle: string;
  anneeScolaireId: number;
  dateDebut?: string;
  dateFin?: string;
  verrouille?: boolean;
}
