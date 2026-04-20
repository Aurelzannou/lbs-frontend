import { Injectable, inject } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastr = inject(NbToastrService);

  success(message: string, title: string = 'Succès'): void {
    console.log('[NotificationService] success:', message);
    this.toastr.success(message, title);
  }

  error(message: string, title: string = 'Erreur'): void {
    console.log('[NotificationService] error:', message);
    this.toastr.danger(message, title);
  }

  info(message: string, title: string = 'Information'): void {
    console.log('[NotificationService] info:', message);
    this.toastr.info(message, title);
  }

  warning(message: string, title: string = 'Attention'): void {
    console.log('[NotificationService] warning:', message);
    this.toastr.warning(message, title);
  }

  /**
   * Boîte de dialogue de confirmation (SweetAlert2)
   */
  async confirm(message: string, title: string = 'Êtes-vous sûr ?'): Promise<boolean> {
    console.log('[NotificationService] confirm:', title, message);
    const result = await Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
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
