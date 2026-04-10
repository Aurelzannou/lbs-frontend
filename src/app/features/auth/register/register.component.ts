import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  NbButtonModule, 
  NbCardModule, 
  NbInputModule, 
  NbLayoutModule, 
  NbIconModule,
  NbAlertModule,
  NbSpinnerModule
} from '@nebular/theme';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbButtonModule,
    NbCardModule,
    NbInputModule,
    NbLayoutModule,
    NbIconModule,
    NbAlertModule,
    NbSpinnerModule
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { confirmPassword, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.error = null;
        // Déclencher une redirection automatique vers la connexion
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { registered: true } });
        }, 4000);
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        
        // Extraction précise du message d'erreur depuis l'ApiResponse du backend
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
        
        console.error('Register error details:', err);
      }
    });
  }
}
