import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ReferentielComponent } from './features/referentiel/referentiel.component';
import { NiveauListComponent } from './features/referentiel/niveaux/niveau-list/niveau-list.component';
import { EtapeListComponent } from './features/referentiel/etapes/etape-list/etape-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'referentiel',
    component: ReferentielComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'niveaux', pathMatch: 'full' },
      { path: 'niveaux', component: NiveauListComponent },
      { path: 'etapes', component: EtapeListComponent },
      { 
        path: 'annees-scolaires', 
        loadComponent: () => import('./features/referentiel/annees-scolaires/annee-scolaire-list/annee-scolaire-list.component').then(m => m.AnneeScolaireListComponent) 
      },
      { 
        path: 'classes', 
        loadComponent: () => import('./features/referentiel/classes/classe-list/classe-list.component').then(m => m.ClasseListComponent) 
      },
      { 
        path: 'professeurs', 
        loadComponent: () => import('./features/referentiel/professeurs/professeur-list/professeur-list.component').then(m => m.ProfesseurListComponent) 
      },
      { 
        path: 'matieres', 
        loadComponent: () => import('./features/referentiel/matieres/matiere-list/matiere-list.component').then(m => m.MatiereListComponent) 
      },
      { 
        path: 'caisses', 
        loadComponent: () => import('./features/referentiel/caisses/caisse-list/caisse-list.component').then(m => m.CaisseListComponent) 
      },
      { 
        path: 'categories-depenses', 
        loadComponent: () => import('./features/referentiel/categories-depenses/categorie-depense-list/categorie-depense-list.component').then(m => m.CategorieDepenseListComponent) 
      },
      { 
        path: 'coefficients', 
        loadComponent: () => import('./features/referentiel/coefficients/coefficient-list/coefficient-list.component').then(m => m.CoefficientListComponent) 
      },
      { 
        path: 'frais-scolaires', 
        loadComponent: () => import('./features/referentiel/frais-scolaires/frais-scolaire-list/frais-scolaire-list.component').then(m => m.FraisScolaireListComponent) 
      },
      { 
        path: 'modes-paiements', 
        loadComponent: () => import('./features/referentiel/modes-paiements/mode-paiement-list/mode-paiement-list.component').then(m => m.ModePaiementListComponent) 
      },
      { 
        path: 'periodes-academiques', 
        loadComponent: () => import('./features/referentiel/periodes-academiques/periode-academique-list/periode-academique-list.component').then(m => m.PeriodeAcademiqueListComponent) 
      },
      { 
        path: 'types-actes', 
        loadComponent: () => import('./features/referentiel/types-actes/type-acte-list/type-acte-list.component').then(m => m.TypeActeListComponent) 
      },
      { 
        path: 'types-frais', 
        loadComponent: () => import('./features/referentiel/types-frais/type-frais-list/type-frais-list.component').then(m => m.TypeFraisListComponent) 
      },
      { 
        path: 'types-operations', 
        loadComponent: () => import('./features/referentiel/types-operations/type-operation-list/type-operation-list.component').then(m => m.TypeOperationListComponent) 
      },
      { 
        path: 'statuts-inscriptions', 
        loadComponent: () => import('./features/referentiel/statuts-inscriptions/statut-inscription-list/statut-inscription-list.component').then(m => m.StatutInscriptionListComponent) 
      }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.UserProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'administration',
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'profils', 
        loadComponent: () => import('./features/administration/profils/profil-list.component').then(m => m.ProfilListComponent) 
      },
      { 
        path: 'menus', 
        loadComponent: () => import('./features/administration/menus/menu-list.component').then(m => m.MenuListComponent) 
      },
      { 
        path: 'utilisateurs', 
        loadComponent: () => import('./features/administration/utilisateurs/user-list.component').then(m => m.UserListComponent) 
      }
    ]
  },
  {
    path: 'scolarite',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'eleves',
        loadComponent: () => import('./features/scolarite/eleves/eleve-list/eleve-list.component').then(m => m.EleveListComponent)
      }
    ]
  },
  // Redirection par défaut pour les routes non trouvées
  { path: '**', redirectTo: 'home' }
];
