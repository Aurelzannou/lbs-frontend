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
      { path: 'etapes', component: EtapeListComponent }
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
