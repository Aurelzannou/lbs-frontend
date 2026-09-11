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

  listerParCaisse(caisseId: number, anneeScolaireId: number | null = null): Observable<MouvementCaisse[]> {
    let params = new HttpParams().set('caisseId', caisseId.toString());
    if (anneeScolaireId !== null) {
      params = params.set('anneeScolaireId', anneeScolaireId.toString());
    }
    return this.api.get<MouvementCaisse[]>(this.endpoint, params);
  }
}
