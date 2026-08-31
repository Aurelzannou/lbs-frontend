import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Changer le mot de passe</h2>

    <mat-dialog-content>
      @if (error) {
        <div class="cp-alert">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="cp-form">
        <mat-form-field appearance="outline">
          <mat-label>Mot de passe actuel</mat-label>
          <mat-icon matPrefix>lock_outline</mat-icon>
          <input
            matInput
            [type]="show.current ? 'text' : 'password'"
            formControlName="currentPassword"
            autocomplete="current-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="show.current = !show.current"
            [attr.aria-label]="show.current ? 'Cacher' : 'Afficher'"
          >
            <mat-icon>{{ show.current ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.get('currentPassword')?.hasError('required')">
            Ce champ est requis
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nouveau mot de passe</mat-label>
          <mat-icon matPrefix>lock_reset</mat-icon>
          <input
            matInput
            [type]="show.next ? 'text' : 'password'"
            formControlName="newPassword"
            autocomplete="new-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="show.next = !show.next"
            [attr.aria-label]="show.next ? 'Cacher' : 'Afficher'"
          >
            <mat-icon>{{ show.next ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-hint>8 caractères minimum</mat-hint>
          <mat-error *ngIf="form.get('newPassword')?.hasError('required')">
            Ce champ est requis
          </mat-error>
          <mat-error *ngIf="form.get('newPassword')?.hasError('minlength')">
            Au moins 8 caractères
          </mat-error>
        </mat-form-field>

        @if (form.hasError('sameAsCurrent') && form.get('newPassword')?.value) {
          <p class="cp-field-error">Le nouveau mot de passe doit être différent de l'actuel.</p>
        }

        <mat-form-field appearance="outline">
          <mat-label>Confirmer le nouveau mot de passe</mat-label>
          <mat-icon matPrefix>lock_reset</mat-icon>
          <input
            matInput
            [type]="show.confirm ? 'text' : 'password'"
            formControlName="confirmPassword"
            autocomplete="new-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="show.confirm = !show.confirm"
            [attr.aria-label]="show.confirm ? 'Cacher' : 'Afficher'"
          >
            <mat-icon>{{ show.confirm ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.get('confirmPassword')?.hasError('required')">
            Ce champ est requis
          </mat-error>
        </mat-form-field>

        @if (
          form.hasError('mismatch') &&
          form.get('confirmPassword')?.value &&
          form.get('confirmPassword')?.touched
        ) {
          <p class="cp-field-error">Les deux mots de passe ne correspondent pas.</p>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()" [disabled]="loading">Annuler</button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        (click)="onSubmit()"
        [disabled]="loading || form.invalid"
      >
        <mat-spinner *ngIf="loading" diameter="18" class="cp-spinner"></mat-spinner>
        <span *ngIf="!loading">Modifier</span>
        <span *ngIf="loading">Modification…</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 420px;
      }
      .cp-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
      }
      mat-form-field {
        width: 100%;
      }
      .cp-alert {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        border-radius: 8px;
        padding: 0.7rem 0.9rem;
        margin-bottom: 0.75rem;
        font-size: 0.88rem;

        mat-icon {
          font-size: 1.1rem;
          width: 1.1rem;
          height: 1.1rem;
          flex-shrink: 0;
        }
      }
      .cp-field-error {
        color: #dc2626;
        font-size: 0.78rem;
        margin: -0.35rem 0 0.6rem;
        padding-left: 0.25rem;
      }
      .cp-spinner {
        display: inline-block;
      }
      [mat-flat-button] {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
    `
  ]
})
export class ChangePasswordDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);

  loading = false;
  error: string | null = null;
  show = { current: false, next: false, confirm: false };

  form: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: [ChangePasswordDialogComponent.crossFieldValidator] }
  );

  /** Confirmation identique + nouveau mot de passe différent de l'actuel (erreurs portées par le groupe). */
  private static crossFieldValidator(group: AbstractControl): ValidationErrors | null {
    const current = group.get('currentPassword')?.value;
    const next = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;

    const errors: ValidationErrors = {};
    if (next && confirm && next !== confirm) {
      errors['mismatch'] = true;
    }
    if (next && current && next === current) {
      errors['sameAsCurrent'] = true;
    }
    return Object.keys(errors).length ? errors : null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { currentPassword, newPassword } = this.form.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.notification.success('Votre mot de passe a été modifié avec succès.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Impossible de modifier le mot de passe. Veuillez réessayer.';
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
