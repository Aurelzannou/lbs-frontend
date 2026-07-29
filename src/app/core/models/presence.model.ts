export interface SeanceJour {
  emploiTempsId: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  matiereLibelle?: string;
  profNomComplet?: string;
  presenceEnregistree: boolean;
}

export interface EleveStatut {
  eleveId: number;
  nom: string;
  prenom: string;
  statut: string;
}

export interface FeuillePresence {
  emploiTempsId: number;
  date: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  classeLibelle?: string;
  matiereLibelle?: string;
  profId: number;
  profNomComplet?: string;
  profStatut: string;
  eleves: EleveStatut[];
}

export interface FeuillePresenceRequest {
  emploiTempsId: number;
  date: string;
  profStatut: string;
  eleves: { eleveId: number; statut: string }[];
}

export interface PresenceHistorique {
  date: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  matiereLibelle?: string;
  statut: string;
}

export interface PresenceEnfant {
  eleveId: number;
  eleveNomComplet: string;
  historique: PresenceHistorique[];
}
