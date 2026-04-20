export interface TypeOperation {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  description?: string;
}

export interface TypeOperationRequest {
  code: string;
  libelle: string;
  description?: string;
}
