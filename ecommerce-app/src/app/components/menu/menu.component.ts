import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';
import { CarritoService } from '../../core/services/cart/carrito.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  cantidadProductos: number = 0;

  
    constructor(
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.carritoService.contador$.subscribe(contador => {
      this.cantidadProductos = contador;
      this.cdr.detectChanges();
    });
  }

  
  // POPUP DE LOGIN
    showLoginPopup() {

    Swal.fire({
      title: 'Iniciar sesión',
       html: `
        <input type="text" id="email" class="swal2-input" placeholder="Correo">
        <input type="password" id="password" class="swal2-input" placeholder="Contraseña">
        <a id="register-link" style="margin-top:10px; display:block; cursor:pointer; color:#3085d6;font-size:13px;">
          ¿No tienes cuenta? Regístrate aquí
        </a>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ingresar',
      cancelButtonText: 'Cancelar',
      didRender: () => {
        document.getElementById('register-link')!.addEventListener('click', () => {
          Swal.close();
          this.showRegisterSwal();   
        });
      },
      preConfirm: () => {
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        return { email, password };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.auth.login(result.value).subscribe({
          next: () => {
            Swal.fire('Bienvenido', 'Sesión iniciada', 'success');
            this.carritoService.refreshCartCount();
          },
          error: err =>
            Swal.fire('Error', err?.error?.message || 'Credenciales inválidas', 'error')
        });
      }
    });
  }

  // POPUP DE REGISTRO 
  showRegisterSwal = () => {
  Swal.fire({
    title: 'Crear cuenta',
    html: ` <div style="max-height: 400px; overflow-y: auto; padding: 10px;"> 
    <input type="text" id="reg-name" class="swal2-input" placeholder="Nombre completo *" required> 
    <input type="email" id="reg-email" class="swal2-input" placeholder="Correo *" required> 
    <input type="tel" id="reg-phone" class="swal2-input" placeholder="Teléfono (10 dígitos) *" maxlength="10" required> 
    <input type="password" id="reg-password" class="swal2-input" placeholder="Contraseña *" required> 
    <hr style="margin: 15px 0;"> 
    <p style="font-size: 14px; color: #666; margin: 10px 0;">Datos de envío (opcional)</p> 
    <input type="text" id="reg-address" class="swal2-input" placeholder="Dirección"> 
    <input type="text" id="reg-city" class="swal2-input" placeholder="Ciudad"> 
    <input type="text" id="reg-state" class="swal2-input" placeholder="Estado"> 
    <input type="text" id="reg-postal" class="swal2-input" placeholder="Código Postal (5 dígitos)" maxlength="5"> 
    </div> 
    <p style="font-size: 12px; color: #999; margin-top: 10px;">* Campos requeridos</p> `,
    confirmButtonText: 'Registrarme',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    width: '500px',
    preConfirm: () => {
      const displayName = (document.getElementById('reg-name') as HTMLInputElement).value;
      const email = (document.getElementById('reg-email') as HTMLInputElement).value;
      const phone = (document.getElementById('reg-phone') as HTMLInputElement).value;
      const password = (document.getElementById('reg-password') as HTMLInputElement).value;
      const address = (document.getElementById('reg-address') as HTMLInputElement).value;
      const city = (document.getElementById('reg-city') as HTMLInputElement).value;
      const state = (document.getElementById('reg-state') as HTMLInputElement).value;
      const postalCode = (document.getElementById('reg-postal') as HTMLInputElement).value;

      // Validaciones
      if (!displayName || !email || !phone || !password) {
        Swal.showValidationMessage('Por favor completa todos los campos requeridos');
        return false;
      }
      if (phone.length !== 10) {
        Swal.showValidationMessage('El teléfono debe tener 10 dígitos');
        return false;
      }
      if (postalCode && postalCode.length !== 5) {
        Swal.showValidationMessage('El código postal debe tener 5 dígitos');
        return false;
      }
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        Swal.showValidationMessage('Por favor ingresa un email válido');
        return false;
      }

      return {
        displayName,
        email,
        phone,
        password, 
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        postalCode: postalCode || undefined,
        role: 'customer'
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.auth.register(result.value).subscribe({
        next: () => {
          Swal.fire({
            title: 'Éxito',
            text: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
            icon: 'success',
            confirmButtonText: 'Iniciar sesión'
          }).then(() => {
            this.showLoginPopup();
          });
        },
        error: (err) => {
          Swal.fire('Error', err?.error?.message || 'No se pudo registrar la cuenta', 'error');
        }
      });
    }
  });
};


  // VERIFICAR SI ES ADMIN
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
}