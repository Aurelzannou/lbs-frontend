import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MouvementCaisse } from '../models/mouvement-caisse.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MouvementCaisseService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/mouvements-caisse';

  listerParCaisse(caisseId: number): Observable<MouvementCaisse[]> {
    const params = new HttpParams().set('caisseId', caisseId.toString());
    return this.api.get<MouvementCaisse[]>(this.endpoint, params);
  }
}
