export interface ValidationBulletin {
  classeId: number;
  classeLibelle?: string;
  periodeId: number;
  anneeScolaireId?: number;
  valide: boolean;
  dateValidation?: string;
  valideParEmail?: string;
}
