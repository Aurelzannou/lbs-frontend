export interface Etape {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  description?: string;
}

export interface EtapeRequest {
  code: string;
  libelle: string;
  description?: string;
}
