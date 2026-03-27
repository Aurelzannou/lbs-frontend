export interface Utilisateur {
  id?: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  actif: boolean;
  roles?: string[];
}

export interface Profil {
  id?: number;
  libelle: string;
  code: string;
}
