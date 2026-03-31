/**
 * AdminComponent
 * --------------
 * Panel de administración para gestionar los productos del sistema.
 * Solo accesible para usuarios con rol 'admin'.
 * Permite agregar, editar y eliminar criptomonedas.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../core/services/products.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  products: Product[] = [];

  // Formulario agregar producto
  newCoinId = '';
  addError = '';
  addSuccess = '';
  addLoading = false;

  // Edición inline
  editingId: number | null = null;
  editName = '';
  editSymbol = '';
  editError = '';
  editLoading = false;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (data) => this.products = data
    });
  }

  /** Agrega un nuevo producto al sistema */
  addProduct(): void {
    if (!this.newCoinId.trim()) {
      this.addError = 'Ingresa un coin ID válido';
      return;
    }

    this.addLoading = true;
    this.addError = '';
    this.addSuccess = '';

    this.productsService.add(this.newCoinId.trim().toLowerCase()).subscribe({
      next: (product) => {
        this.addSuccess = `${product.name} agregado exitosamente`;
        this.newCoinId = '';
        this.addLoading = false;
        this.loadProducts();
      },
      error: (err) => {
        this.addError = err.error?.detail || 'Error al agregar el producto';
        this.addLoading = false;
      }
    });
  }

  /** Activa el modo edición para un producto */
  startEdit(product: Product): void {
    this.editingId = product.id;
    this.editName = product.name;
    this.editSymbol = product.symbol;
    this.editError = '';
  }

  /** Cancela la edición */
  cancelEdit(): void {
    this.editingId = null;
    this.editError = '';
  }

  /** Guarda los cambios de un producto */
  saveEdit(id: number): void {
    this.editLoading = true;
    this.editError = '';

    this.productsService.update(id, {
      name: this.editName,
      symbol: this.editSymbol
    }).subscribe({
      next: () => {
        this.editingId = null;
        this.editLoading = false;
        this.loadProducts();
      },
      error: (err) => {
        this.editError = err.error?.detail || 'Error al actualizar';
        this.editLoading = false;
      }
    });
  }

  /** Elimina un producto del sistema */
  deleteProduct(id: number, name: string): void {
    if (!confirm(`¿Estás seguro de eliminar ${name}?`)) return;

    this.productsService.delete(id).subscribe({
      next: () => this.loadProducts()
    });
  }

  /** Formatea precio en USD */
  formatPrice(price: number | null): string {
    if (!price) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}