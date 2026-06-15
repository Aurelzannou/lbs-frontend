import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class HistoriqueService {
  private api = inject(ApiService);

  getByDossier(uuid: string): Observable<any> {
    return this.api.get<any>(`/api/historique/dossiers/${uuid}`);
  }
}
