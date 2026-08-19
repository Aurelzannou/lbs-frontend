import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SuiviPaiement } from '../models/suivi-paiement.model';

@Injectable({
  providedIn: 'root'
})
export class SuiviPaiementService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/suivi-paiements';

  getSuiviParDossier(dossierEleveId: number): Observable<SuiviPaiement> {
    return this.api.get<SuiviPaiement>(`${this.endpoint}/dossier/${dossierEleveId}`);
  }
}
