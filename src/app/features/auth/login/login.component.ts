import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = inject(FormBuilder).group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });
  
  loading = false;
  showPassword = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ne pas rediriger si un logout est en cours (phase transitoire avant Keycloak logout)
    if (this.authService.isLoggingOut) {
      return;
    }

    // Si déjà connecté, rediriger selon les rôles
    if (this.authService.isLoggedIn) {
      // Lire les rôles depuis le token stocké pour cohérence avec onSubmit
      const storedToken = localStorage.getItem('access_token');
      const businessRoles = storedToken
        ? this.authService.getRolesFromToken(storedToken)
        : this.authService.getBusinessRoles();

      this.authService.redirectAfterLogin(businessRoles);
      return;
    }
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
      next: (result: any) => {
        // Les rôles sont extraits directement du JWT — fiables immédiatement
        const businessRoles: string[] = result?.businessRoles ?? this.authService.getBusinessRoles();
        
        console.log('Rôles métier détectés :', businessRoles);
        this.authService.redirectAfterLogin(businessRoles);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Identifiants invalides ou erreur de connexion.';
        console.error('Login error:', err);
      }
    });
  }


}
