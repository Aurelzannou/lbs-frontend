import { Injectable, NgZone, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const FEDAPAY_SCRIPT = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';

/** Résultat du widget FedaPay (le statut réel doit être confirmé côté backend via `verifier`). */
export type FedaPayResultat = 'complete' | 'annule' | 'echec';

/**
 * Ouvre le widget de paiement FedaPay (mode inline) pour une transaction déjà créée côté backend.
 * Partagé entre l'inscription et le portail parent.
 */
@Injectable({ providedIn: 'root' })
export class FedaPayService {
  private doc = inject(DOCUMENT);
  private zone = inject(NgZone);

  private chargerScript(): Promise<void> {
    const w = window as any;
    if (w.FedaPay) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const existing = this.doc.querySelector(`script[src="${FEDAPAY_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        if (w.FedaPay) resolve();
        return;
      }
      const s = this.doc.createElement('script');
      s.src = FEDAPAY_SCRIPT;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject();
      this.doc.body.appendChild(s);
    });
  }

  /**
   * Ouvre le modal FedaPay pour la transaction donnée et résout quand le parent le ferme.
   * - `annule`   : le parent a fermé le modal sans payer
   * - `complete` : le modal s'est terminé → il faut vérifier le statut réel côté backend
   * - `echec`    : le widget n'a pas pu se charger / s'initialiser
   */
  payer(publicKey: string, transactionId: number): Promise<FedaPayResultat> {
    return this.chargerScript()
      .then(
        () =>
          new Promise<FedaPayResultat>((resolve) => {
            const w = window as any;
            const FedaPay = w.FedaPay;
            if (!FedaPay || typeof FedaPay.init !== 'function') {
              console.error('[fedapay] SDK non chargé');
              resolve('echec');
              return;
            }

            let done = false;
            const finir = (r: FedaPayResultat) => {
              if (!done) {
                done = true;
                resolve(r);
              }
            };
            const onComplete = (resp: any) =>
              this.zone.run(() => {
                const dismissed =
                  resp?.reason === FedaPay?.DIALOG_DISMISSED || resp?.reason === 'DIALOG_DISMISSED';
                finir(dismissed ? 'annule' : 'complete');
              });

            const config = { public_key: publicKey, transaction: { id: transactionId }, onComplete };

            // 1) Ouverture programmatique sans élément (certaines versions du SDK le supportent).
            try {
              const widget = FedaPay.init(config as any);
              if (widget && typeof widget.open === 'function') {
                widget.open();
                return;
              }
            } catch (e) {
              /* on tente le repli ci-dessous */
            }

            // 2) Repli : bouton hors écran (mais présent/mesurable) attaché au SDK.
            const btn = this.doc.createElement('button');
            btn.id = 'fedapay-portail-btn-' + transactionId;
            btn.textContent = 'Payer';
            btn.style.cssText =
              'position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;';
            this.doc.body.appendChild(btn);
            const nettoyer = () => btn.parentNode && btn.parentNode.removeChild(btn);
            const onCompleteRepli = (resp: any) => {
              nettoyer();
              onComplete(resp);
            };

            try {
              const widget = FedaPay.init('#' + btn.id, { ...config, onComplete: onCompleteRepli });
              setTimeout(() => {
                try {
                  if (widget && typeof widget.open === 'function') widget.open();
                  else btn.click();
                } catch (e) {
                  console.error('[fedapay] open()', e);
                  nettoyer();
                  finir('echec');
                }
              }, 60);
            } catch (e) {
              console.error('[fedapay] init()', e);
              nettoyer();
              finir('echec');
            }
          })
      )
      .catch((e) => {
        console.error('[fedapay] chargement script', e);
        return 'echec' as FedaPayResultat;
      });
  }
}
