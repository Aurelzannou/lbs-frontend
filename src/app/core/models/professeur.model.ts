export interface Professeur {
  id?: number;
  uuid?: string;
  code: string;
  nom: string;
  prenom: string;
  email?: string;
  residence?: string;
  num?: string;
  actif?: boolean;
  keycloakId?: string;
  matiereIds?: number[];
  matiereLibelles?: string[];
  classeIds?: number[];
  classeLibelles?: string[];
  compteProvisionneMaintenant?: boolean;
}

export interface ProfesseurRequest {
  code: string;
  nom: string;
  prenom: string;
  email?: string;
  residence?: string;
  num?: string;
  actif?: boolean;
  matiereIds?: number[];
  classeIds?: number[];
}
