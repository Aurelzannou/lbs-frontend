import { Inscription } from './eleve.model';
import { ModePaiement } from './mode-paiement.model';
import { Caisse } from './caisse.model';
import { DossierEleve } from './dossier-eleve.model';

export interface Paiement {
  id?: number;
  uuid?: string;
  dossierEleveId?: number;
  dossierEleve?: DossierEleve;
  montant: number;
  datePaiement?: string;
  modePaiementId?: number;
  modePaiement?: ModePaiement;
  canal: 'EN_LIGNE' | 'SUR_PLACE';
  statutTransaction?: 'INITIE' | 'EN_COURS' | 'SUCCES' | 'ECHEC' | 'ESPECES';
  referenceFeeda?: string;
  telephonePaiement?: string;
  caisseId?: number;
  caisse?: Caisse;
  numeroRecu?: string;
  effectuePar?: string;
  observation?: string;
}
