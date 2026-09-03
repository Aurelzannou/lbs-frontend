export interface ValidationBulletin {
  classeId: number;
  classeLibelle?: string;
  periodeId: number;
  anneeScolaireId?: number;
  valide: boolean;
  dateValidation?: string;
  valideParEmail?: string;
  /** Matières envoyées par les professeurs / total des matières de la classe. */
  matieresRecues?: number;
  matieresTotal?: number;
}
