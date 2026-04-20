export interface TypeActe {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
}

export interface TypeActeRequest {
  code: string;
  libelle: string;
}
