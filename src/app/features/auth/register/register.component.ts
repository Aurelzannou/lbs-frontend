import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  showPassword = false;
  userType: 'ADMIN' | 'PARENT' = 'ADMIN';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName:       ['', [Validators.required]],
      lastName:        ['', [Validators.required]],
      email:           ['', [Validators.required, Validators.email]],
      username:        ['', [Validators.required, Validators.minLength(3)]],
      telephone:       [''],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.passwordMatchValidator] } as AbstractControlOptions);
  }

  setUserType(type: 'ADMIN' | 'PARENT'): void {
    this.userType = type;
    const usernameCtrl  = this.registerForm.get('username');
    const telephoneCtrl = this.registerForm.get('telephone');

    if (type === 'ADMIN') {
      usernameCtrl?.setValidators([Validators.required, Validators.minLength(3)]);
      telephoneCtrl?.clearValidators();
    } else {
      usernameCtrl?.clearValidators();
      telephoneCtrl?.setValidators([Validators.required]);
    }

    usernameCtrl?.updateValueAndValidity();
    telephoneCtrl?.updateValueAndValidity();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = null;

    const { confirmPassword, ...formData } = this.registerForm.value;
    const payload = { ...formData, userType: this.userType };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { registered: true } });
        }, 4000);
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.error = err.error.message;
        } else if (typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            this.error = parsed.message || "Une erreur est survenue lors de l'inscription.";
          } catch {
            this.error = err.error;
          }
        } else {
          this.error = "Impossible de contacter le serveur. Veuillez réessayer plus tard.";
        }
        console.error('Register error:', err);
      }
    });
  }
}
