import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService } from '../../core/services/cart/carrito.service';
import { ShippingAddressService } from '../../core/services/shipping-address/shipping-address.service';
import { PaymentMethodService } from '../../core/services/payment-method/payment-method.service';
import { OrderService } from '../../core/services/order/order.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, map, delay } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  carrito: any[] = [];
  total: number = 0;
  pagoExitoso: boolean = false;
  checkoutForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router, 
    private carritoService: CarritoService, 
    private shippingService: ShippingAddressService,
    private paymentService: PaymentMethodService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCarrito();
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      titular: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      email: ['', 
        [Validators.required, Validators.email],
        [this.emailAsyncValidator.bind(this)] // Validación asíncrona
      ],
      tarjeta: ['', [
        Validators.required,
        this.tarjetaValidator // Validador personalizado
      ]],
      fecha: ['', [
        Validators.required,
        this.fechaExpiracionValidator // Validador personalizado
      ]],
      cvv: ['', [
        Validators.required,
        Validators.pattern(/^\d{3,4}$/),
        Validators.minLength(3),
        Validators.maxLength(4)
      ]],
      direccionEnvio: ['', [
        Validators.required,
        Validators.minLength(10)
      ]]
    });
  }

  loadCarrito() {
    this.carritoService.getCarrito().subscribe(cart => {
      this.carrito = cart.products;
      this.total = this.carrito.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
    });
  }

  // Validador síncrono personalizado para número de tarjeta
  tarjetaValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.replace(/\s/g, '');
    
    if (!value) return null;

    // Validar que solo contenga números
    if (!/^\d+$/.test(value)) {
      return { formatoInvalido: true };
    }

    // Validar longitud (entre 13 y 19 dígitos)
    if (value.length < 13 || value.length > 19) {
      return { longitudInvalida: true };
    }

    return null;
  }

  // Validador síncrono personalizado para fecha de expiración
  fechaExpiracionValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) return null;

    // Validar formato MM/AA
    const regex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    if (!regex.test(value)) {
      return { formatoFechaInvalido: true };
    }

    const [mes, anio] = value.split('/');
    const mesNum = parseInt(mes);
    const anioNum = parseInt('20' + anio);

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    // Validar que no esté expirada
    if (anioNum < anioActual || (anioNum === anioActual && mesNum < mesActual)) {
      return { tarjetaExpirada: true };
    }

    // Validar que no sea más de 20 años en el futuro
    if (anioNum > anioActual + 20) {
      return { fechaFutura: true };
    }

    return null;
  }

  // Validador asíncrono para email (simula verificación en servidor)
  emailAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    // Simular llamada al servidor con delay
    return of(control.value).pipe(
      delay(500),
      map(email => {

        const blockedEmails = ['test@blocked.com', 'spam@blocked.com'];
        
        if (blockedEmails.includes(email.toLowerCase())) {
          return { emailBloqueado: true };
        }
        
        return null;
      })
    );
  }

  // Getters para facilitar acceso a los controles en el template
  get f() {
    return this.checkoutForm.controls;
  }

  get titular() {
    return this.checkoutForm.get('titular');
  }

  get email() {
    return this.checkoutForm.get('email');
  }

  get tarjeta() {
    return this.checkoutForm.get('tarjeta');
  }

  get fecha() {
    return this.checkoutForm.get('fecha');
  }

  get cvv() {
    return this.checkoutForm.get('cvv');
  }

  get direccionEnvio() {
    return this.checkoutForm.get('direccionEnvio');
  }

  // Formatear número de tarjeta mientras el usuario escribe
  formatearTarjeta(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.checkoutForm.patchValue({ tarjeta: formattedValue }, { emitEvent: false });
  }

  // Formatear fecha mientras el usuario escribe
  formatearFecha(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.checkoutForm.patchValue({ fecha: value }, { emitEvent: false });
  }

  procesarPago() {
    this.submitted = true;

    // Validar formulario
    if (this.checkoutForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
      alert('Por favor complete correctamente todos los campos del formulario.');
      return;
    }

    const formValues = this.checkoutForm.value;
    const userId = this.authService.getCurrentUser()?._id;
    
    // Crear dirección de envío
    const shippingData = {
      user: userId,
      name: formValues.titular,
      address: formValues.direccionEnvio,
      city: 'Aguascalientes', 
      state: 'Aguascalientes',
      postalCode: '20000', 
      country: 'México',
      phone: '1234567890', 
      isDefault: false
    };

    // Crear método de pago
    const paymentData = {
      user: userId,
      type: 'credit_card',
      cardNumber: formValues.tarjeta.replace(/\s/g, ''),
      cardHolderName: formValues.titular,
      expiryDate: formValues.fecha, 
      isDefault: false
    };

    // Crear dirección, método de pago y luego la orden
    forkJoin({
      shipping: this.shippingService.create(shippingData),
      payment: this.paymentService.create(paymentData)
    }).pipe(
      switchMap(({ shipping, payment }) => {
        // Preparar productos para la orden
        const products = this.carrito.map((item: any) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        }));

        // Crear la orden
        const orderData = {
          user: userId,
          products: products,
          shippingAddress: shipping._id,
          paymentMethod: payment._id,
          shippingCost: 0,
          totalPrice: this.total
        };

        return this.orderService.create(orderData);
      }),
      switchMap((order) => {
        // Guardar en localStorage para confirmación
        localStorage.setItem('pedido', JSON.stringify({
          orderId: order._id,
          direccion: formValues.direccionEnvio,
          titular: formValues.titular,
          email: formValues.email,
          total: this.total,
          fecha: new Date()
        }));

        // Vaciar carrito
        return this.carritoService.vaciarCarrito();
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/confirmacion']);
      },
      error: (err) => {
        console.error('Error al procesar pago:', err);
        alert('Hubo un error al procesar tu pedido. Intenta nuevamente.');
      }
    });
  }
}