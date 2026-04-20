import { Niveau } from './niveau.model';

export interface Classe {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  niveauId: number;
  niveau?: Niveau;
  profId?: number;
  capaciteMax?: number;
  actif?: boolean;
}

export interface ClasseRequest {
  code: string;
  libelle: string;
  niveauId: number;
  profId?: number;
  capaciteMax?: number;
  actif?: boolean;
}
