import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth/auth.service';

describe('LoginComponent (form interaction)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({

      imports: [LoginComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería navegar al perfil si login es exitoso (simulando inputs)', () => {
    authServiceSpy.login.and.returnValue(of({ message: 'Login exitoso' }));

    // Simular que el usuario escribe en los inputs
    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="email"]');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="password"]');

    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '123456';
    passwordInput.dispatchEvent(new Event('input'));

    // Simular submit del formulario
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/perfil']);
    expect(component.error).toBe('');
  });

  it('debería mostrar error si login falla (simulando inputs)', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: { message: 'Credenciales incorrectas' } }))
    );

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="email"]');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="password"]');

    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'wrong';
    passwordInput.dispatchEvent(new Event('input'));

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    fixture.detectChanges();

    expect(component.error).toBe('Credenciales incorrectas');
  });
});
