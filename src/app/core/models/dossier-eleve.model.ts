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
  eleveNom?: string;
  elevePrenom?: string;
  sexe?: string;
  dateNaissance?: string;
  souffrant?: boolean;
  provenance?: string;
  classeId?: number;
  classe?: Classe;
  classeLibelle?: string;
  anneeScolaireId?: number;
  anneeScolaire?: AnneeScolaire;
  anneeScolaireLibelle?: string;
  dateDebut?: string;
  dateFin?: string;
  statutId?: number;
  statutCode?: string;
  statutLibelle?: string;
  statut?: StatutInscription;
  etapeCouranteId?: number;
  etapeCourante?: Etape;
  remise?: number;
  typeOperationId?: number;
  acteId?: number;
  utilisateurId?: number;
}
