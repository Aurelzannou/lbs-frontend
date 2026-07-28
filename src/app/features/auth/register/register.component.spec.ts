import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let authServiceSpy: jasmine.SpyObj<Pick<AuthService, 'register'>>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  function createComponent() {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should require firstName, lastName, email, telephone and password (tuteur-only form)', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.registerForm.valid).toBeFalse();
    expect(
      fixture.componentInstance.registerForm.get('telephone')?.hasError('required')
    ).toBeTrue();
  });

  it('should flag mismatched password confirmation', () => {
    const fixture = createComponent();
    const form = fixture.componentInstance.registerForm;
    form.patchValue({ password: 'abcdef', confirmPassword: 'different' });
    expect(form.hasError('mismatch')).toBeTrue();
  });

  it('should submit a payload without a userType field', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    authServiceSpy.register.and.returnValue(of({}));

    component.registerForm.setValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      telephone: '+229 97 00 00 00',
      password: 'secret1',
      confirmPassword: 'secret1'
    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledTimes(1);
    const payload = authServiceSpy.register.calls.mostRecent().args[0];
    expect(payload.userType).toBeUndefined();
    expect(payload.username).toBeUndefined();
    expect(payload.telephone).toBe('+229 97 00 00 00');
  });
});
