import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MujeresComponent } from './colecciones/mujeres/mujeres.component';
import { HombresComponent } from './colecciones/hombres/hombres.component';
import { KidsComponent } from './colecciones/kids/kids.component';
import { AccesoriosComponent } from './colecciones/accesorios/accesorios.component';
import { NgModule } from '@angular/core';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ReporteTemporadaComponent } from './components/reporte-temporada/reporte-temporada.component';
import { ProfileComponent } from './pages/profile//profile/profile.component';
import { adminGuard } from './core/guards/admin/admin.guard';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { LoginComponent } from './pages/login/login/login.component';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { AdminClientsComponent } from './pages/admin/admin-clients/admin-clients.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' }, 
    { path: 'mujeres', component: MujeresComponent },
    { path: 'hombres', component: HombresComponent },
    { path: 'kids', component: KidsComponent },
    { path: 'accesorios', component: AccesoriosComponent },
    { path: 'producto/:id', component: ProductDetailComponent },
    { path: 'carrito',loadComponent: () => import('./pages/carrito/carrito.component').then(m => m.CarritoComponent)},
    { path: 'checkout', component: CheckoutComponent },
    { path: 'confirmacion', loadComponent: () => import('./pages/confirmacion/confirmacion.component').then(m => m.ConfirmacionComponent)},
    { path: 'reporte-temporada/:temporada', component: ReporteTemporadaComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'admin/products', component: AdminProductsComponent, canActivate: [adminGuard]},
    { path: 'admin/clients', component: AdminClientsComponent, canActivate: [adminGuard]},
    { path: '**', redirectTo: ''},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}
