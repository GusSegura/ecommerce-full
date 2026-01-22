import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth/auth.service';

describe('RegisterComponent (form interaction con id)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'checkEmailExist']);
    authServiceSpy.checkEmailExist.and.returnValue(of(false));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería navegar al perfil si el registro es exitoso (simulando inputs)', () => {
    authServiceSpy.register.and.returnValue(of({ message: 'Registro exitoso' }));

    const el: HTMLElement = fixture.nativeElement;

    // Simular que el usuario llena los inputs por id
    (el.querySelector('#displayName') as HTMLInputElement).value = 'Test User';
    (el.querySelector('#displayName') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#email') as HTMLInputElement).value = 'test@test.com';
    (el.querySelector('#email') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#phone') as HTMLInputElement).value = '1234567890';
    (el.querySelector('#phone') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#dateOfBirth') as HTMLInputElement).value = '2000-01-01';
    (el.querySelector('#dateOfBirth') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#password') as HTMLInputElement).value = '123456';
    (el.querySelector('#password') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#repeatPassword') as HTMLInputElement).value = '123456';
    (el.querySelector('#repeatPassword') as HTMLInputElement).dispatchEvent(new Event('input'));

    fixture.detectChanges();

    // Simular submit del formulario
    const form: HTMLFormElement = el.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/perfil']);
    expect(component.error).toBe('');
  });

  it('debería mostrar error si el registro falla (simulando inputs)', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({ error: { message: 'Email ya registrado' } }))
    );

    const el: HTMLElement = fixture.nativeElement;

    (el.querySelector('#displayName') as HTMLInputElement).value = 'Test User';
    (el.querySelector('#displayName') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#email') as HTMLInputElement).value = 'test@test.com';
    (el.querySelector('#email') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#phone') as HTMLInputElement).value = '1234567890';
    (el.querySelector('#phone') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#dateOfBirth') as HTMLInputElement).value = '2000-01-01';
    (el.querySelector('#dateOfBirth') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#password') as HTMLInputElement).value = '123456';
    (el.querySelector('#password') as HTMLInputElement).dispatchEvent(new Event('input'));

    (el.querySelector('#repeatPassword') as HTMLInputElement).value = '123456';
    (el.querySelector('#repeatPassword') as HTMLInputElement).dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const form: HTMLFormElement = el.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.error).toBe('Email ya registrado');
  });
});
