import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TuteurAuthService } from '../../../core/services/tuteur-auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-portal-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatStepperModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class PortalRegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(TuteurAuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = false;
  hidePassword = true;

  registerForm = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone1: ['', [Validators.required]],
    telephone2: [''],
    profession: [''],
    adresse: [''],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.notification.success('Compte créé', 'Vous pouvez maintenant vous connecter');
          this.router.navigate(['/portail/login']);
        },
        error: (err) => {
          this.loading = false;
          this.notification.error(err, 'Échec de l\'inscription');
        }
      });
    }
  }
}
