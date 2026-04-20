import { Matiere } from './matiere.model';
import { Niveau } from './niveau.model';

export interface Coefficient {
  id?: number;
  uuid?: string;
  code: string;
  matiereId: number;
  matiere?: Matiere;
  niveauId: number;
  niveau?: Niveau;
  valeur: number;
}

export interface CoefficientRequest {
  code: string;
  matiereId: number;
  niveauId: number;
  valeur: number;
}
