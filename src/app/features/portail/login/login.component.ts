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

@Component({
  selector: 'app-portal-login',
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
    MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class PortalLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(TuteurAuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = false;
  hidePassword = true;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.notification.success('Connexion réussie', 'Bienvenue sur votre portail');
          this.router.navigate(['/portail/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.notification.error('Email ou mot de passe incorrect', 'Échec de la connexion');
        }
      });
    }
  }
}
