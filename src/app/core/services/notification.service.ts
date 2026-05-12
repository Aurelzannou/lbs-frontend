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
