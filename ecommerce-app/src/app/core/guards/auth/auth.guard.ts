import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(p0: any, p1: any): boolean {
    if (this.auth.isLogged()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
