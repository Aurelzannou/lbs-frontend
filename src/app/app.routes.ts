import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ReferentielComponent } from './features/referentiel/referentiel.component';
import { NiveauListComponent } from './features/referentiel/niveaux/niveau-list/niveau-list.component';
import { EtapeListComponent } from './features/referentiel/etapes/etape-list/etape-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
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
  // Ajoutez d'autres routes ici
];
