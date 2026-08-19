export interface SuiviTranche {
  echeancierId: number;
  numero: number;
  libelle?: string;
  dateEcheance: string;
  montant: number;
  montantAlloue: number;
  statut: 'PAYEE' | 'PARTIELLE' | 'EN_ATTENTE' | 'EN_RETARD';
}

export interface SuiviFrais {
  fraisScolaireId: number;
  typeFraisLibelle?: string;
  montantDu: number;
  montantPaye: number;
  reste: number;
  tranches: SuiviTranche[];
}

export interface SuiviPaiement {
  dossierEleveId: number;
  totalDu: number;
  totalPaye: number;
  totalReste: number;
  frais: SuiviFrais[];
}
