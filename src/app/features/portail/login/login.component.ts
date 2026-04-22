import { Component, inject, OnInit } from '@angular/core';
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
  selector: 'app-portal-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class PortalLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    if (this.authService.isLoggingOut) {
      return;
    }
    
    if (this.authService.isLoggedIn) {
      const storedToken = localStorage.getItem('access_token');
      const roles = storedToken 
        ? this.authService.getRolesFromToken(storedToken)
        : this.authService.getBusinessRoles();
      this.authService.redirectAfterLogin(roles);
    }
  }

  loading = false;
  showPassword = false;
  error: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      
      const { email, password } = this.loginForm.value;

      this.authService.loginWithCredentials(email!, password!).subscribe({
        next: (result: any) => {
          this.notification.success('Connexion réussie', 'Bienvenue sur votre portail');
          const roles = result?.businessRoles ?? this.authService.getBusinessRoles();
          this.authService.redirectAfterLogin(roles);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.error = 'Email ou mot de passe incorrect. Veuillez réessayer.';
        }
      });
    }
  }
}
