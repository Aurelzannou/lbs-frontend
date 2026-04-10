import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NbMenuItem } from '@nebular/theme';

export interface MenuResponse {
  id: number;
  uuid: string;
  code: string;
  description: string;
  path: string;
  ordre: number;
  titre: string;
  menuEnfantId: number | null;
  listeMenuEnfant: MenuResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly apiUrl = `${environment.apiUrl}/api/menus`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les menus de l'utilisateur connecté et les convertit au format NbMenuItem
   */
  getMenuItems(): Observable<NbMenuItem[]> {
    return this.http.get<MenuResponse[]>(`${this.apiUrl}/my-menu`).pipe(
      map(menus => this.mapToNbMenuItems(menus))
    );
  }

  private mapToNbMenuItems(menus: MenuResponse[]): NbMenuItem[] {
    return menus.map(menu => {
      const enfants = menu.listeMenuEnfant && menu.listeMenuEnfant.length > 0
        ? this.mapToNbMenuItems(menu.listeMenuEnfant)
        : undefined;

      const item: NbMenuItem = {
        title: menu.titre,
        link: menu.path || undefined,
        icon: this.getIconByCode(menu.code),
        children: enfants
      };

      // Si c'est un groupe parent (pas de path → pas de lien, seulement des enfants)
      if (!menu.path && enfants && enfants.length > 0) {
        item.link = undefined;
        item.expanded = false;
      }

      return item;
    });
  }

  /**
   * Récupère tous les menus pour l'administration
   */
  getAll(): Observable<MenuResponse[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/administration/menus`).pipe(
      map(response => response.data)
    );
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
   * Helper pour mapper un code de menu à une icône Nebular/Eva
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
