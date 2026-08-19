import { ModePaiement } from './mode-paiement.model';
import { Caisse } from './caisse.model';
import { DossierEleve } from './dossier-eleve.model';
import { FraisScolaire } from './frais-scolaire.model';

export interface Paiement {
  id?: number;
  uuid?: string;
  code?: string;
  reference?: string;
  dossierEleveId: number;
  dossierEleve?: DossierEleve;
  fraisScolaireId: number;
  fraisScolaire?: FraisScolaire;
  datePaiement: string;
  montant: number;
  modePaiementId: number;
  modePaiement?: ModePaiement;
  caisseId: number;
  caisse?: Caisse;
  utilisateurId?: number;
  observation?: string;
  canal?: 'EN_LIGNE' | 'SUR_PLACE';
  statutTransaction?: 'INITIE' | 'SUCCES' | 'ECHEC' | 'ANNULE';
  telephonePaiement?: string;
}

export interface PaiementRequest {
  reference?: string;
  dossierEleveId: number;
  fraisScolaireId: number;
  datePaiement: string;
  montant: number;
  modePaiementId: number;
  caisseId: number;
  utilisateurId?: number;
  observation?: string;
  canal?: string;
  telephonePaiement?: string;
}
