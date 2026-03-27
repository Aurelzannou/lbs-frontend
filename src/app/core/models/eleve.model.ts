export interface Eleve {
  id?: number;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  photo?: string;
}

export interface Inscription {
  id?: number;
  dateInscription: string;
  montantTotal: number;
  resteAPayer: number;
  statut: string;
  eleve: Eleve;
  classeId: number;
  anneeScolaireId: number;
}
