export interface StatutInscription {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
}

export interface StatutInscriptionRequest {
  code: string;
  libelle: string;
}
