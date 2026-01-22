import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
user: any;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtén el usuario actual del servicio
    this.user = this.auth.getCurrentUser(); 
    console.log('Datos del usuario:', this.user);
  }

  goBack() {
    this.router.navigate(['/']);
  }

}