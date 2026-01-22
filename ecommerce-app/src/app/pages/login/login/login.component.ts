import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ FormsModule ]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        this.router.navigate(['/perfil']);
      },
      error: err => {
        this.error = err?.error?.message || 'Credenciales incorrectas';
      }
    });
  }
}
