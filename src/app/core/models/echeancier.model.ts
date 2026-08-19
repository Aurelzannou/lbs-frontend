import { FraisScolaire } from './frais-scolaire.model';

export interface Echeancier {
  id?: number;
  uuid?: string;
  code?: string;
  fraisScolaireId: number;
  fraisScolaire?: FraisScolaire;
  numero: number;
  libelle?: string;
  dateEcheance: string;
  montant: number;
}

export interface EcheancierRequest {
  fraisScolaireId: number;
  numero: number;
  libelle?: string;
  dateEcheance: string;
  montant: number;
}
