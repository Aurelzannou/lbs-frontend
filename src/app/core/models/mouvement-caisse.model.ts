export interface MouvementCaisse {
  id?: number;
  uuid?: string;
  code?: string;
  caisseId: number;
  caisseLibelle?: string;
  typeMouvement: 'ENTREE' | 'SORTIE';
  montant: number;
  dateMouvement: string;
  source: 'PAIEMENT' | 'DEPENSE';
  sourceId: number;
  soldeApres: number;
  description?: string;
}
