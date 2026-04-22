import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { 
  NbButtonModule, 
  NbCardModule, 
  NbInputModule, 
  NbIconModule, 
  NbSpinnerModule, 
  NbAlertModule 
} from '@nebular/theme';

@Component({
  selector: 'app-portal-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbButtonModule,
    NbCardModule,
    NbInputModule,
    NbIconModule,
    NbSpinnerModule,
    NbAlertModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class PortalRegisterComponent {
  private fb = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private notification = inject(NotificationService);

  loading = false;
  showPassword = false;
  error: string | null = null;

  registerForm = this.fb.group({
    lastName: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone1: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = null;

      // On prépare les données pour le backend en suivant les noms attendus
      const userData = {
        ...this.registerForm.value,
        username: this.registerForm.value.email, // L'email sert d'identifiant
        role: 'TUTEUR'
      };

      this.authService.register(userData).subscribe({
        next: () => {
          this.notification.success('Compte créé', 'Vous pouvez maintenant vous connecter');
          this.router.navigate(['/portail/login']);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          // Si err est un objet avec un message, on l'affiche
          if (err.error && err.error.message) {
            this.error = err.error.message;
          } else {
            this.error = 'Une erreur est survenue lors de la création du compte.';
          }
        }
      });
    }
  }
}
