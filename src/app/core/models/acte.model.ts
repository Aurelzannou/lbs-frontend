import { TypeActe } from './type-acte.model';

export interface Acte {
  id?: number;
  uuid?: string;
  code: string;
  reference: string;
  typeActeId: number;
  typeActe?: TypeActe;
  cheminFichier?: string;
  nomFichier?: string;
}

export interface ActeRequest {
  code: string;
  reference: string;
  typeActeId: number;
  cheminFichier?: string;
  nomFichier?: string;
}
