import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../core/services/auth/auth.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const mockUser = {
  _id: '123',
  displayName: 'Test User',
  email: 'test@test.com',
  phone: '1234567890',
  role: 'admin',
  avatar: 'https://placehold.co/100x100.png',
  isActive: true
};
authServiceSpy.getCurrentUser.and.returnValue(mockUser);


    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar los datos del usuario en el template', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h3')?.textContent).toContain('Test User');
    expect(el.querySelector('p')?.textContent).toContain('test@test.com');
    expect(el.querySelector('img')?.getAttribute('src')).toBe('https://placehold.co/100x100.png');
  });

  it('debería navegar al inicio cuando se hace click en el botón', () => {
    const el: HTMLElement = fixture.nativeElement;
    const button: HTMLButtonElement = el.querySelector('button')!;
    button.click();
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
