import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface MenuResponse {
  id: number;
  uuid: string;
  code: string;
  description: string;
  icon: string;
  path: string;
  ordre: number;
  titre: string;
  menuEnfantId: number | null;
  listeMenuEnfant: MenuResponse[];
  profils?: any[];
}

export interface MenuItem {
  title: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly apiUrl = `${environment.apiUrl}/api/menus`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Récupère les menus de l'utilisateur connecté et les convertit au format MenuItem
   */
  getMenuItems(): Observable<MenuItem[]> {
    const selectedProfile = this.authService.getSelectedProfile();
    let params = new HttpParams();
    if (selectedProfile) {
      params = params.set('profilCode', selectedProfile);
    }

    return this.http.get<any>(`${this.apiUrl}/my-menu`, { params }).pipe(
      map(response => {
        const menus = response.data || [];
        return this.mapToMenuItems(menus);
      })
    );
  }

  private mapToMenuItems(menus: MenuResponse[]): MenuItem[] {
    return menus.map(menu => {
      const enfants = menu.listeMenuEnfant && menu.listeMenuEnfant.length > 0
        ? this.mapToMenuItems(menu.listeMenuEnfant)
        : undefined;

      const item: MenuItem = {
        title: menu.titre,
        link: menu.path || undefined,
        icon: menu.icon || this.getIconByCode(menu.code),
        children: enfants
      };

      if (!menu.path && enfants && enfants.length > 0) {
        item.link = undefined;
        item.expanded = false;
      }

      return item;
    });
  }

  /**
   * Récupère tous les menus pour l'administration (avec pagination et recherche)
   */
  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('filter', filter);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getOne(id: number): Observable<MenuResponse> {
    return this.http.get<any>(`${environment.apiUrl}/api/administration/menus/${id}`).pipe(
      map(response => response.data)
    );
  }

  create(menu: any): Observable<MenuResponse> {
    return this.http.post<any>(`${environment.apiUrl}/api/administration/menus`, menu).pipe(
      map(response => response.data)
    );
  }

  update(id: number, menu: any): Observable<MenuResponse> {
    return this.http.put<any>(`${environment.apiUrl}/api/administration/menus/${id}`, menu).pipe(
      map(response => response.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<any>(`${environment.apiUrl}/api/administration/menus/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Fallback: mapper un code de menu à une icône Eva
   */
  getIconByCode(code: string): string {
    const iconMap: { [key: string]: string } = {
      'DASHBOARD': 'home-outline',
      'REFERENTIEL': 'settings-2-outline',
      'NIVEAU': 'layers-outline',
      'ETAPE': 'list-outline',
      'ADMINISTRATION': 'shield-outline',
      'USER': 'people-outline',
      'PROFIL': 'lock-outline',
      'MENU': 'menu-outline',
    };
    return iconMap[code] || 'cube-outline';
  }
}
