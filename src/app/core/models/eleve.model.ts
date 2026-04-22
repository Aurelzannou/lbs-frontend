import { Classe } from './classe.model';

export interface Eleve {
  id?: number;
  uuid?: string;
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  age?: number;
  souffrant: boolean;
  provenance: string;
  actif?: boolean;
  photo?: string;
  classeId?: number;
  classe?: Classe;
  tuteurId?: number;
  tuteur?: any; // To be replaced with Tuteur when imported
}

export interface Inscription {
  id?: number;
  dateInscription: string;
  montantTotal: number;
  resteAPayer: number;
  statut: string;
  eleve: Eleve;
  classeId: number;
  anneeScolaireId: number;
}
