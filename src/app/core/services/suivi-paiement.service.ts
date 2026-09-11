import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SuiviPaiement } from '../models/suivi-paiement.model';
import { SuiviGlobalLigne } from '../models/suivi-global-ligne.model';

@Injectable({
  providedIn: 'root'
})
export class SuiviPaiementService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private readonly endpoint = '/api/suivi-paiements';

  getSuiviParDossier(dossierEleveId: number): Observable<SuiviPaiement> {
    return this.api.get<SuiviPaiement>(`${this.endpoint}/dossier/${dossierEleveId}`);
  }

  /** Vue globale « Tous les impayés » — tous filtres optionnels (null = pas de restriction). */
  listerImpayes(
    anneeScolaireId: number | null,
    classeId: number | null,
    statut: string | null
  ): Observable<SuiviGlobalLigne[]> {
    let params = new HttpParams();
    if (anneeScolaireId !== null) params = params.set('anneeScolaireId', anneeScolaireId.toString());
    if (classeId !== null) params = params.set('classeId', classeId.toString());
    if (statut) params = params.set('statut', statut);
    return this.api.get<SuiviGlobalLigne[]>(`${this.endpoint}/impayes`, params);
  }

  telechargerImpayesPdf(
    anneeScolaireId: number | null,
    classeId: number | null,
    statut: string | null
  ): Observable<Blob> {
    let params = new HttpParams();
    if (anneeScolaireId !== null) params = params.set('anneeScolaireId', anneeScolaireId.toString());
    if (classeId !== null) params = params.set('classeId', classeId.toString());
    if (statut) params = params.set('statut', statut);
    return this.http.get(`${this.baseUrl}${this.endpoint}/impayes/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
