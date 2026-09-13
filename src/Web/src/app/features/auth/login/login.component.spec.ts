// src/Web/src/app/features/auth/login/login.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../shared/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should have a valid form with correct email and password', () => {
    component.form.setValue({ email: 'test@test.com', password: 'password123' });
    expect(component.form.valid).toBe(true);
  });

  it('should mark form invalid with a malformed email', () => {
    component.form.setValue({ email: 'not-an-email', password: 'password123' });
    expect(component.form.valid).toBe(false);
  });

  it('should not call authService.login when form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard on successful login', () => {
    authServiceMock.login.mockReturnValue(of({ accessToken: 'x', refreshToken: 'y', accessTokenExpiresAt: '' }));
    component.form.setValue({ email: 'test@test.com', password: 'password123' });

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set an error message on failed login', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));
    component.form.setValue({ email: 'test@test.com', password: 'wrongpassword' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid email or password.');
  });
});