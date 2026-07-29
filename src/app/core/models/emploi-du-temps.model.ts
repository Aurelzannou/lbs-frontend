export interface EmploiDuTemps {
  id?: number;
  uuid?: string;
  code?: string;
  classeId: number;
  classeLibelle?: string;
  anneeScolaireId: number;
  anneeScolaireLibelle?: string;
  matiereId: number;
  matiereLibelle?: string;
  profId: number;
  profNomComplet?: string;
  profActif?: boolean;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface EmploiDuTempsRequest {
  classeId: number;
  anneeScolaireId: number;
  matiereId: number;
  profId: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
}
