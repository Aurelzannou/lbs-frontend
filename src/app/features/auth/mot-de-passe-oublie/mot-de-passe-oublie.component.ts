import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './mot-de-passe-oublie.component.html',
  styleUrl: './mot-de-passe-oublie.component.scss'
})
export class MotDePasseOublieComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;
  envoye = false;
  error: string | null = null;

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    this.authService.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.envoye = true;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.error?.message ||
          "Impossible d'envoyer l'email pour le moment. Réessayez dans quelques instants.";
        this.loading = false;
      }
    });
  }

  allerVersLogin(): void {
    this.router.navigate(['/login']);
  }
}
