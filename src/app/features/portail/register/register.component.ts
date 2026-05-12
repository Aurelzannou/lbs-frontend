import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TuteurAuthService } from '../../../core/services/tuteur-auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-portal-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule, MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
    ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class PortalRegisterComponent {
  private fb = inject(FormBuilder);
  private tuteurAuthService = inject(TuteurAuthService);
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

      // Mapper les noms de champs du formulaire vers le TuteurRequest du backend
      const formData = this.registerForm.value;
      const tuteurData = {
        nom: formData.lastName,
        prenom: formData.firstName,
        email: formData.email,
        telephone1: formData.telephone1,
        motDePasse: formData.password
      };

      this.tuteurAuthService.register(tuteurData).subscribe({
        next: () => {
          this.notification.success('Compte créé', 'Vous pouvez maintenant vous connecter');
          this.router.navigate(['/portail/login']);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
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
