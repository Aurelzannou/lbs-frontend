import { Eleve } from './eleve.model';
import { Classe } from './classe.model';
import { AnneeScolaire } from './annee-scolaire.model';
import { StatutInscription } from './statut-inscription.model';
import { Etape } from './etape.model';

export interface DossierEleve {
  id?: number;
  uuid?: string;
  code?: string;
  numero?: string;
  eleveId?: number;
  eleve?: Eleve;
  classeId?: number;
  classe?: Classe;
  anneeScolaireId?: number;
  anneeScolaire?: AnneeScolaire;
  dateDebut?: string;
  dateFin?: string;
  statutId?: number;
  statut?: StatutInscription;
  etapeCouranteId?: number;
  etapeCourante?: Etape;
  remise?: number;
  typeOperationId?: number;
  acteId?: number;
  utilisateurId?: number;
}
