import { Niveau } from './niveau.model';

export interface Classe {
  id?: number;
  uuid?: string;
  code: string;
  libelle: string;
  niveauId: number;
  niveau?: Niveau;
  profId?: number;
  capaciteMax?: number;
  actif?: boolean;
  /** Matières enseignées dans cette classe — source de vérité pour la saisie des notes et le
      bulletin (indépendant du niveau ou de l'emploi du temps). */
  matiereIds?: number[];
}

export interface ClasseRequest {
  code: string;
  libelle: string;
  niveauId: number;
  profId?: number;
  capaciteMax?: number;
  actif?: boolean;
  matiereIds?: number[];
}
