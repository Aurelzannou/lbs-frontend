import { Component, OnInit, inject } from '@angular/core';
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
    // Si déjà connecté, rediriger selon les rôles
    if (this.authService.isLoggedIn) {
      const roles = this.authService.getRoles();
      const relevantRoles = this.filterRelevantRoles(roles);

      if (relevantRoles.includes('TUTEUR') && relevantRoles.length === 1) {
        this.router.navigate(['/portail/dashboard']);
      } else if (relevantRoles.length > 1) {
        this.router.navigate(['/auth/select-profile']);
      } else if (relevantRoles.includes('ADMIN') || relevantRoles.includes('SECRETAIRE')) {
        this.router.navigate(['/dashboard']);
      } else {
        // Par défaut vers le portail
        this.router.navigate(['/portail/dashboard']);
      }
      return;
    }
  }

  private filterRelevantRoles(roles: string[]): string[] {
    const technicalRoles = ['offline_access', 'uma_authorization', 'default-roles-lbs'];
    return roles.filter(role => !technicalRoles.includes(role) && !role.startsWith('default-roles-'));
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
        const roles = this.authService.getRoles();
        const relevantRoles = this.filterRelevantRoles(roles);
        
        console.log('Rôles détectés par le Front :', roles);
        console.log('Rôles filtrés :', relevantRoles);
        
        if (relevantRoles.includes('TUTEUR') && relevantRoles.length === 1) {
          this.router.navigate(['/portail/dashboard']);
        } else if (relevantRoles.length > 1) {
          this.router.navigate(['/auth/select-profile']);
        } else if (relevantRoles.includes('ADMIN') || relevantRoles.includes('SECRETAIRE')) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/portail/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Identifiants invalides ou erreur de connexion.';
        console.error('Login error:', err);
      }
    });
  }
}
