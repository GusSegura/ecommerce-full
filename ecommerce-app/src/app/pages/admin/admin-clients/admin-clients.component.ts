import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService, Cliente } from '../../../core/services/clientes/clientes.service';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-clients.component.html',
  styleUrls: ['./admin-clients.component.css']
})
export class AdminClientsComponent implements OnInit {
  clientForm!: FormGroup;
  clients: Cliente[] = [];
  // pagination: any = {};
  pagination = {
  totalPages: 0,
  currentPage: 1,
  hasPrev: false,
  hasNext: false
};
  editMode = false;
  currentClientId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadClients();
  }

  initForm() {
  this.clientForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
    phone: [''],
    address: [''],
    city: [''],
    state: [''],
    postalCode: [''],
    isActive: [true]
  });
}

  loadClients(page: number = 1) {
    console.log('📋 Cargando clientes página:', page);
    
    this.clientesService.getAll(page).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del servidor:', response);
        
        if (response && Array.isArray(response.users)) {
          this.clients = response.users;
          this.pagination = response.pagination;
          console.log('📊 Clientes cargados:', this.clients.length);
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response);
          this.clients = [];
        }
      },
      error: (err) => {
        console.error('❌ Error cargando clientes:', err);
        alert('Error al cargar clientes');
      }
    });
  }

  onSubmit() {
  if (this.clientForm.invalid) {
    alert('Por favor completa todos los campos correctamente');
    return;
  }

  // Obtenemos los valores del formulario
  const clientData = { ...this.clientForm.value };

  // 👇 Si estamos editando y el campo password está vacío, lo eliminamos del objeto
  if (this.editMode && !clientData.password) {
    delete clientData.password;
  }

  console.log('💾 Guardando cliente:', clientData);

  if (this.editMode && this.currentClientId) {
    // Actualizar
    this.clientesService.update(this.currentClientId, clientData).subscribe({
      next: (response) => {
        console.log('✅ Cliente actualizado:', response);
        alert(`Cliente "${response.displayName}" actualizado correctamente`);
        this.resetForm();
        this.loadClients();
      },
      error: (err) => {
        console.error('❌ Error actualizando:', err);
        alert('Error al actualizar el cliente');
      }
    });
  } else {
    // Crear
    this.clientesService.create(clientData).subscribe({
      next: (response) => {
        console.log('✅ Cliente creado:', response);
        alert(`Cliente "${response.displayName}" creado correctamente`);
        this.resetForm();
        this.loadClients();
      },
      error: (err) => {
        console.error('❌ Error creando:', err);
        alert('Error al crear el cliente: ' + (err.error?.error || err.message));
      }
    });
  }
}



  // editClient(client: Cliente) {
  //   console.log('📝 Editando cliente:', client);
    
  //   this.editMode = true;
  //   this.currentClientId = client._id || null;
    
  //   this.clientForm.patchValue({
  //     name: client.displayName,
  //     email: client.email,
  //     phone: client.phone || '',
  //     address: client.address || '',
  //     city: client.city || '',
  //     state: client.state || '',
  //     postalCode: client.postalCode || '',
  //     isActive: client.isActive
  //   });

  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }

  editClient(client: Cliente) {
  console.log('📝 Editando cliente:', client);

  this.editMode = true;
  this.currentClientId = client._id || null;

  this.clientForm.patchValue({
    displayName: client.displayName,   
    email: client.email,
    phone: client.phone || '',
    address: client.address || '',
    city: client.city || '',
    state: client.state || '',
    postalCode: client.postalCode || '',
    isActive: client.isActive,
    role: client.role || 'customer',   
    password: ''                       
  });

  // password sea opcional al editar
  this.clientForm.get('password')?.clearValidators();
  this.clientForm.get('password')?.updateValueAndValidity();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


  deleteClient(clientId: string, clientName: string) {
    if (!confirm(`¿Estás seguro de eliminar a ${clientName}?`)) return;

    this.clientesService.delete(clientId).subscribe({
      next: () => {
        alert('Cliente eliminado correctamente');
        this.loadClients();
      },
      error: (err) => {
        console.error('Error eliminando cliente:', err);
        alert('Error al eliminar el cliente');
      }
    });
  }

  toggleClientStatus(client: Cliente) {
    const newStatus = !client.isActive;
    
    this.clientesService.update(client._id!, { isActive: newStatus }).subscribe({
      next: () => {
        alert(`Cliente ${newStatus ? 'activado' : 'desactivado'} correctamente`);
        this.loadClients();
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
        alert('Error al actualizar el estado del cliente');
      }
    });
  }

  // resetForm() {
  //   this.clientForm.reset({ isActive: true });
  //   this.editMode = false;
  //   this.currentClientId = null;
  // }

resetForm() {
  this.clientForm.reset({ isActive: true, role: 'customer' });
  this.editMode = false;
  this.currentClientId = null;

  // restauramos validadores de password
  this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
  this.clientForm.get('password')?.updateValueAndValidity();
}


  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX');
  }
}