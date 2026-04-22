export interface Tuteur {
  id?: number;
  uuid?: string;
  code?: string;
  nom: string;
  prenom: string;
  telephone1: string;
  telephone2?: string;
  email: string;
  profession?: string;
  adresse?: string;
  actif?: boolean;
}
