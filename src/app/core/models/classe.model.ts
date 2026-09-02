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
  /** Coefficient par matière (résolu depuis le référentiel du niveau de la classe). */
  coefficients?: { [matiereId: number]: number };
}

export interface MatiereCoefficient {
  matiereId: number;
  coefficient: number;
}

export interface ClasseRequest {
  code: string;
  libelle: string;
  niveauId: number;
  profId?: number;
  capaciteMax?: number;
  actif?: boolean;
  matiereIds?: number[];
  /** Matière + coefficient, saisis directement sur le formulaire de la classe. */
  matieres?: MatiereCoefficient[];
}
