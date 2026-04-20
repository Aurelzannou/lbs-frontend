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
}

export interface PeriodeAcademiqueRequest {
  code: string;
  libelle: string;
  anneeScolaireId: number;
  dateDebut?: string;
  dateFin?: string;
  verrouille?: boolean;
}
