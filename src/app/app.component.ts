import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { OneColumnLayoutComponent } from './@theme/layouts/one-column-layout.component';
import { AuthService } from './core/services/auth.service';
import { MenuService } from './core/services/menu.service';
import { filter } from 'rxjs/operators';

export interface MenuItem {
  title: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OneColumnLayoutComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'lbs-frontend';
  menu: MenuItem[] = [];
  showLayout = true;

  private noLayoutPaths = ['/login', '/register', '/auth', '/home', '/portail'];
  private lastLoadedProfile: string | null = null;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private menuService: MenuService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.showLayout = !this.noLayoutPaths.some(path => url.includes(path));

      if (this.showLayout && this.authService.isLoggedIn) {
        const currentProfile = this.authService.getSelectedProfile();
        if (this.menu.length === 0 || currentProfile !== this.lastLoadedProfile) {
          this.loadMenu();
          this.lastLoadedProfile = currentProfile;
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.loadMenu();
      this.lastLoadedProfile = this.authService.getSelectedProfile();
    }
  }

  private loadMenu(): void {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menu = items;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du menu:', err);
      }
    });
  }
}
