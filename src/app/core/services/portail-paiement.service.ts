import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SuiviTranche {
  echeancierId: number;
  numero: number;
  libelle: string | null;
  dateEcheance: string | null;
  montant: number;
  montantAlloue: number;
  statut: 'PAYEE' | 'PARTIELLE' | 'EN_RETARD' | 'EN_ATTENTE';
}

export interface SuiviFrais {
  fraisScolaireId: number;
  typeFraisLibelle: string | null;
  montantDu: number;
  montantPaye: number;
  reste: number;
  tranches: SuiviTranche[];
}

export interface SuiviPaiement {
  dossierEleveId: number;
  totalDu: number;
  totalPaye: number;
  totalReste: number;
  frais: SuiviFrais[];
}

export interface PaiementInit {
  fedapayTransactionId: number;
  publicKey: string;
  montant: number;
  devise: string;
  description: string;
  checkoutUrl: string | null;
}

export interface PaiementStatut {
  statut: string;
  fedapayStatut: string;
  paye: boolean;
}

@Injectable({ providedIn: 'root' })
export class PortailPaiementService {
  private api = inject(ApiService);

  /** Détail des frais + tranches + reste à payer d'un dossier de l'enfant. */
  getSuivi(dossierId: number): Observable<SuiviPaiement> {
    return this.api.get<SuiviPaiement>(`/api/portail/dossiers/${dossierId}/suivi`);
  }

  /**
   * Lance le paiement en ligne d'un frais scolaire.
   * @param montant montant choisi par le parent (FCFA). Omis = solde du restant dû.
   */
  initPaiement(
    dossierId: number,
    fraisId: number,
    montant?: number | null,
    telephonePaiement?: string
  ): Observable<PaiementInit> {
    return this.api.post<PaiementInit>(
      `/api/portail/dossiers/${dossierId}/frais/${fraisId}/paiement/init`,
      { montant: montant ?? null, telephonePaiement: telephonePaiement || null }
    );
  }

  /** Relit le statut de la transaction FedaPay et met à jour le paiement LBS. */
  verifierPaiement(fedapayTransactionId: number | string): Observable<PaiementStatut> {
    return this.api.get<PaiementStatut>(`/api/inscription/paiement/${fedapayTransactionId}/verifier`);
  }
}
