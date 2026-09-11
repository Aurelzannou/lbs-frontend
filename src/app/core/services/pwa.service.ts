import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

/**
 * Événement `beforeinstallprompt` — non typé dans lib.dom.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Regroupe les 3 comportements PWA côté UI :
 *  - proposer le rechargement quand une nouvelle version du service worker est prête ;
 *  - exposer l'état en ligne / hors-ligne ;
 *  - capturer l'invite d'installation et permettre de la déclencher depuis un bouton.
 *
 * Le service worker n'est actif qu'en build de production (voir app.config.ts) ; en dev
 * `SwUpdate.isEnabled` est `false` et tout ici devient inerte.
 */
@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly toastr = inject(ToastrService);

  /** `true` tant que le navigateur se déclare en ligne. */
  readonly enLigne = signal<boolean>(navigator.onLine);

  /** `true` quand une nouvelle version est téléchargée et prête à être activée. */
  readonly miseAJourDisponible = signal<boolean>(false);

  private promptEvent: BeforeInstallPromptEvent | null = null;
  /** `true` quand le navigateur a émis `beforeinstallprompt` (app installable, pas encore installée). */
  readonly installable = signal<boolean>(false);

  constructor() {
    this.surveillerConnexion();
    this.surveillerInstallation();
    this.surveillerMisesAJour();
  }

  // ─── Connexion ─────────────────────────────────────────────────────────────

  private surveillerConnexion(): void {
    window.addEventListener('online', () => this.enLigne.set(true));
    window.addEventListener('offline', () => this.enLigne.set(false));
  }

  // ─── Installation ──────────────────────────────────────────────────────────

  /** `true` si l'app tourne déjà en mode installé (écran d'accueil / standalone). */
  get estInstallee(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  }

  private surveillerInstallation(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.promptEvent = e as BeforeInstallPromptEvent;
      this.installable.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.promptEvent = null;
      this.installable.set(false);
    });
  }

  /** Déclenche l'invite d'installation native. Renvoie `true` si l'utilisateur a accepté. */
  async installer(): Promise<boolean> {
    if (!this.promptEvent) return false;
    await this.promptEvent.prompt();
    const { outcome } = await this.promptEvent.userChoice;
    this.promptEvent = null;
    this.installable.set(false);
    return outcome === 'accepted';
  }

  // ─── Mises à jour ──────────────────────────────────────────────────────────

  private surveillerMisesAJour(): void {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        this.miseAJourDisponible.set(true);
        const toast = this.toastr.info(
          'Cliquez ici pour charger la dernière version.',
          'Mise à jour disponible',
          { disableTimeOut: true, tapToDismiss: false }
        );
        toast?.onTap.subscribe(() => this.appliquerMiseAJour());
      });

    // Vérifie une fois au démarrage (utile si l'app reste ouverte longtemps ce sera relayé par le SW).
    this.swUpdate.checkForUpdate().catch(() => {});
  }

  appliquerMiseAJour(): void {
    this.swUpdate
      .activateUpdate()
      .then(() => document.location.reload())
      .catch(() => document.location.reload());
  }
}
