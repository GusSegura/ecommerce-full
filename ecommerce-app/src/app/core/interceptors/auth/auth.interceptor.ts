import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
   const isApiRequest = req.url.includes('/api/');

  let authReq = req;
  if (token && isApiRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']); // Opcional: redirigir al login
      }
      return throwError(() => err);
    })
  );
};