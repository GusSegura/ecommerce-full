import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductosService } from '../../../core/services/product/productos.service';
import { Ropa } from '../../../core/types/ropa';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  productForm!: FormGroup;
  products: any[] = [];
  categories: any[] = [];
  pagination: any = {};
  editMode = false;
  currentProductId: string | null = null;
  selectedFiles: File[] = [];
  imagesPreviews: string[] = [];

  private API = 'http://localhost:3000/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private productosService: ProductosService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProducts();
    this.loadCategories();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      season: ['', Validators.required],
      imagesUrl: ['', Validators.required] 
    });
  }

  loadCategories() {
    this.http.get<any[]>(`${this.API}/categories`).subscribe({
      next: (response) => {
        this.categories = Array.isArray(response) ? response : [];
        console.log('Categorías cargadas:', this.categories);
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.categories = [];
      }
    });
  }

  loadProducts(page: number = 1) {
    this.http.get<any>(`${this.API}/products?page=${page}`).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.products)) {
          this.products = response.products;
          this.pagination = response.pagination;
        } else {
          this.products = [];
        }
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.products = [];
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    console.log('📸 Archivos seleccionados:', files?.length);
    
    if (files && files.length > 0) {
      // Limpiar selección anterior
      this.selectedFiles = [];
      this.imagesPreviews = [];
      
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
        console.log(`Archivo ${i + 1}:`, files[i].name, files[i].type, files[i].size);
        
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.imagesPreviews.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagesPreviews.splice(index, 1);
  }

  // ⬇️ MÉTODO UNIFICADO PARA CREAR/EDITAR
  onSubmit() {
  if (this.productForm.invalid) {
    alert('Por favor completa todos los campos correctamente');
    return;
  }

  const productData = this.productForm.value;

  if (this.editMode && this.currentProductId) {
    this.http.put(`${this.API}/products/${this.currentProductId}`, productData).subscribe({
      next: (response: any) => {
        alert(`Producto "${response.name}" actualizado correctamente`);
        this.resetForm();
        this.loadProducts();
      },
      error: (err) => {
        console.error('❌ Error actualizando:', err);
        alert('Error al actualizar el producto');
      }
    });
  } else {
    this.http.post(`${this.API}/products`, productData).subscribe({
      next: (response: any) => {
        alert(`Producto "${response.name}" creado correctamente`);
        this.resetForm();
        this.loadProducts();
      },
      error: (err) => {
        console.error('❌ Error creando:', err);
        alert('Error al crear el producto');
      }
    });
  }
}


  editProduct(product: any) {
    this.editMode = true;
    this.currentProductId = product._id;
    
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category._id || product.category,
      season: product.season
    });

    // Limpiar imágenes seleccionadas (las existentes se mantienen en el servidor)
    this.selectedFiles = [];
    this.imagesPreviews = [];
    
    console.log('📝 Modo edición activado para:', product.name);
  }

  deleteProduct(productId: string) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    this.http.delete(`${this.API}/products/${productId}`).subscribe({
      next: () => {
        alert('Producto eliminado');
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error eliminando producto', err);
        alert('Error al eliminar el producto');
      }
    });
  }

  resetForm() {
    this.productForm.reset();
    this.editMode = false;
    this.currentProductId = null;
    this.selectedFiles = [];
    this.imagesPreviews = [];
    
    console.log('🔄 Formulario reseteado');
  }


getImageUrl(imagePath: string): string {
  const baseUrl = 'http://localhost:3000';
  
  // Si la ruta ya tiene /public
  if (imagePath.startsWith('/public/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Si es una ruta vieja sin /public
  return `${baseUrl}/public${imagePath}`;
}

getCategoryName(categoryId: string): string {
  const cat = this.categories.find(c => c._id === categoryId);
  return cat ? cat.name : 'N/A';
}

}