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
}

export interface ProfesseurRequest {
  code: string;
  nom: string;
  prenom: string;
  email?: string;
  residence?: string;
  num?: string;
  actif?: boolean;
}
