import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastr = inject(ToastrService);

  success(message: string, title: string = 'Succès'): void {
    this.toastr.success(message, title);
  }

  error(error: any, title: string = 'Erreur'): void {
    let message = 'Une erreur est survenue';

    if (typeof error === 'string') {
      message = error;
    } else if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    this.toastr.error(message, title);
  }

  info(message: string, title: string = 'Information'): void {
    this.toastr.info(message, title);
  }

  warning(message: string, title: string = 'Attention'): void {
    this.toastr.warning(message, title);
  }

  /**
   * Affiche les identifiants de connexion générés (ex: compte professeur auto-provisionné) dans
   * une boîte qui reste ouverte jusqu'à confirmation explicite — ce mot de passe ne sera plus
   * jamais récupérable ensuite, l'admin doit avoir le temps de le transmettre/copier.
   */
  async showCredentials(login: string, password: string): Promise<void> {
    await Swal.fire({
      title: 'Compte de connexion créé',
      html: `
        <p style="margin-bottom: 1rem;">Transmettez ces identifiants à l'intéressé — ce mot de passe ne sera plus jamais affiché après fermeture de cette fenêtre.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:0.75rem 1rem;text-align:left;font-family:monospace;font-size:0.95rem;">
          <div>Identifiant : <b>${login}</b></div>
          <div>Mot de passe : <b>${password}</b></div>
        </div>
      `,
      icon: 'success',
      confirmButtonText: "J'ai noté ces identifiants",
      confirmButtonColor: '#374151',
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: '#ffffff',
      customClass: {
        popup: 'swal2-professional'
      }
    });
  }

  /**
   * Boîte de dialogue de confirmation (SweetAlert2)
   */
  async confirm(message: string, title: string = 'Êtes-vous sûr ?'): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#374151',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Oui, continuer',
      cancelButtonText: 'Annuler',
      background: '#ffffff',
      customClass: {
        popup: 'swal2-professional'
      }
    });
    return result.isConfirmed;
  }
}
