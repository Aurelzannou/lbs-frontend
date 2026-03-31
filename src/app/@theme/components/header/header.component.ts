import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { KeycloakService } from 'keycloak-angular';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NbIconModule, NbSelectModule, NbActionsModule, NbUserModule, NbContextMenuModule } from '@nebular/theme';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    NbIconModule,
    NbSelectModule,
    NbActionsModule,
    NbUserModule,
    NbContextMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any = { name: '', picture: '' };

  themes = [
    { value: 'default', name: 'Light' },
    { value: 'dark', name: 'Dark' },
    { value: 'cosmic', name: 'Cosmic' },
    { value: 'corporate', name: 'Corporate' },
  ];

  currentTheme = 'default';

  userMenu = [ { title: 'Profil', data: 'profile' }, { title: 'Déconnexion', data: 'logout' } ];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.loadUserInfo();

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

    this.menuService.onItemClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.item.data === 'logout') {
          this.keycloakService.logout();
        }
      });
  }

  async loadUserInfo() {
    if (await this.keycloakService.isLoggedIn()) {
      const profile = await this.keycloakService.loadUserProfile();
      this.user.name = `${profile.firstName} ${profile.lastName}`;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
