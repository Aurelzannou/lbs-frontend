import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('motDePasse')?.value;
  const confirmation = control.get('confirmation')?.value;
  return password && confirmation && password !== confirmation ? { mismatch: true } : null;
}

@Component({
  selector: 'app-activer-compte',
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
  templateUrl: './activer-compte.component.html',
  styleUrl: './activer-compte.component.scss'
})
export class ActiverCompteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

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

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = "Lien d'activation invalide : aucun jeton fourni.";
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;

    this.loading = true;
    this.error = null;

    this.http
      .post(
        `${environment.apiUrl}/api/auth/activer-compte-professeur`,
        { token: this.token, motDePasse: this.form.value.motDePasse },
        { responseType: 'text' }
      )
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || "Impossible d'activer le compte. Le lien a peut-être expiré.";
          this.loading = false;
        }
      });
  }

  allerVersLogin(): void {
    this.router.navigate(['/login']);
  }
}
