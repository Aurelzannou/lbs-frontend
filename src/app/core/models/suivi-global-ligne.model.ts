export interface SuiviGlobalLigne {
  dossierEleveId: number;
  eleveNomComplet: string;
  classeLibelle: string;
  anneeScolaireLibelle: string;
  totalDu: number;
  totalPaye: number;
  totalReste: number;
  /** EN_ATTENTE (rien payé) / PARTIELLE (payé en partie) / EN_RETARD (une échéance dépassée). */
  statut: 'EN_ATTENTE' | 'PARTIELLE' | 'EN_RETARD';
}
