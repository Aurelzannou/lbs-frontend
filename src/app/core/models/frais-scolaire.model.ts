import { AnneeScolaire } from './annee-scolaire.model';
import { Classe } from './classe.model';
import { TypeFrais } from './type-frais.model';

export interface FraisScolaire {
  id?: number;
  uuid?: string;
  code: string;
  anneeScolaireId: number;
  anneeScolaire?: AnneeScolaire;
  classeId: number;
  classe?: Classe;
  typeFraisId: number;
  typeFrais?: TypeFrais;
  montant: number;
  actif?: boolean;
}

export interface FraisScolaireRequest {
  code: string;
  anneeScolaireId: number;
  classeId: number;
  typeFraisId: number;
  montant: number;
  actif?: boolean;
}
