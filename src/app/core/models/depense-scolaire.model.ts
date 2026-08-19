import { Caisse } from './caisse.model';
import { CategorieDepense } from './categorie-depense.model';

export interface DepenseScolaire {
  id?: number;
  uuid?: string;
  code?: string;
  reference?: string;
  caisseId: number;
  caisse?: Caisse;
  categorieDepenseId: number;
  categorieDepense?: CategorieDepense;
  montant: number;
  dateDepense: string;
  motif: string;
  utilisateurId?: number;
  annule?: boolean;
}

export interface DepenseScolaireRequest {
  reference?: string;
  caisseId: number;
  categorieDepenseId: number;
  montant: number;
  dateDepense: string;
  motif: string;
  utilisateurId?: number;
}
