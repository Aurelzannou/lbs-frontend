import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NbMenuModule, NbMenuItem } from '@nebular/theme';
import { OneColumnLayoutComponent } from './@theme/layouts/one-column-layout.component';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { MenuService } from './core/services/menu.service';
import { filter } from 'rxjs/operators';
import { OnInit } from '@angular/core';

// Les menus sont maintenant chargés dynamiquement depuis le backend via MenuService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OneColumnLayoutComponent, NbMenuModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'lbs-frontend';
  menu: NbMenuItem[] = [];
  showLayout = true;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private menuService: MenuService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showLayout = !event.urlAfterRedirects.includes('/login') && 
                        !event.urlAfterRedirects.includes('/register');

      // Si l'utilisateur est connecté et que le menu n'est pas encore chargé
      if (this.showLayout && this.authService.isLoggedIn && this.menu.length === 0) {
        this.loadMenu();
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.loadMenu();
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
