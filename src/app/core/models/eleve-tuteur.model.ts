import { Eleve } from './eleve.model';
import { Tuteur } from './tuteur.model';

export interface EleveTuteur {
  id?: number;
  uuid?: string;
  eleveId: number;
  tuteurId: number;
  lienParente?: string;
  contactUrgence?: boolean;
  eleve?: Eleve;
  tuteur?: Tuteur;
}

export interface EleveTuteurRequest {
  eleveId: number;
  tuteurId: number;
  lienParente?: string;
  contactUrgence?: boolean;
}

export const LIENS_PARENTE = ['Père', 'Mère', 'Tuteur', 'Autre'];
