import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NbMenuModule, NbMenuItem } from '@nebular/theme';
import { OneColumnLayoutComponent } from './@theme/layouts/one-column-layout.component';
import { CommonModule } from '@angular/common';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Tableau de bord',
    icon: 'home-outline',
    link: '/dashboard',
    home: true,
  },
  {
    title: 'ADMINISTRATION',
    group: true,
  },
  {
    title: 'Niveaux',
    icon: 'layers-outline',
    link: '/niveaux',
  },
  {
    title: 'Étapes',
    icon: 'list-outline',
    link: '/etapes',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OneColumnLayoutComponent, NbMenuModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'lbs-frontend';
  menu = MENU_ITEMS;
}
