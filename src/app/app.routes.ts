import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NiveauListComponent } from './features/niveaux/niveau-list/niveau-list.component';
import { EtapeListComponent } from './features/etapes/etape-list/etape-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'niveaux', 
    component: NiveauListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'etapes', 
    component: EtapeListComponent, 
    canActivate: [AuthGuard] 
  },
  // Ajoutez d'autres routes ici
];
