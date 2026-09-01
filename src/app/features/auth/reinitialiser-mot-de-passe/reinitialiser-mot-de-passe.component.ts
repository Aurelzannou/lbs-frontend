import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('motDePasse')?.value;
  const confirmation = control.get('confirmation')?.value;
  return password && confirmation && password !== confirmation ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reinitialiser-mot-de-passe',
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
  templateUrl: './reinitialiser-mot-de-passe.component.html',
  styleUrl: './reinitialiser-mot-de-passe.component.scss'
})
export class ReinitialiserMotDePasseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  form: FormGroup = this.fb.group(
    {
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmation: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  token: string | null = null;
  loading = false;
  success = false;
  error: string | null = null;
  showPassword = false;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Lien de réinitialisation invalide : aucun jeton fourni.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;

    this.loading = true;
    this.error = null;

    this.authService.resetPassword(this.token, this.form.value.motDePasse).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.error?.message ||
          'Impossible de réinitialiser le mot de passe. Le lien a peut-être expiré.';
        this.loading = false;
      }
    });
  }

  allerVersLogin(): void {
    this.router.navigate(['/login']);
  }
}
