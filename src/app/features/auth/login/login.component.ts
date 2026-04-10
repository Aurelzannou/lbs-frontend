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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si déjà connecté, rediriger
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { username, password } = this.loginForm.value;

    this.authService.loginWithCredentials(username, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Identifiants invalides ou erreur de connexion.';
        console.error('Login error:', err);
      }
    });
  }
}
