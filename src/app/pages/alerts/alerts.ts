/**
 * AlertsComponent
 * ---------------
 * Página para gestionar las alertas de precio del usuario.
 * Permite crear alertas nuevas y eliminar las existentes.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertsService, Alert } from '../../core/services/alerts.service';
import { ProductsService, Product } from '../../core/services/products.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss'
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];
  products: Product[] = [];

  // Formulario nueva alerta
  selectedProductId: number | null = null;
  targetPrice: number | null = null;
  condition: 'above' | 'below' = 'below';

  error = '';
  success = '';
  loading = false;

  constructor(
    private alertsService: AlertsService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
    this.loadProducts();
  }

  loadAlerts(): void {
    this.alertsService.getMyAlerts().subscribe({
      next: (data) => this.alerts = data
    });
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (data) => this.products = data
    });
  }

  /** Crea una nueva alerta */
  createAlert(): void {
    if (!this.selectedProductId || !this.targetPrice) {
      this.error = 'Completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.alertsService.create({
      product_id: this.selectedProductId,
      target_price: this.targetPrice,
      condition: this.condition
    }).subscribe({
      next: () => {
        this.success = 'Alerta creada exitosamente';
        this.selectedProductId = null;
        this.targetPrice = null;
        this.loading = false;
        this.loadAlerts();
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al crear la alerta';
        this.loading = false;
      }
    });
  }

  /** Elimina una alerta */
  deleteAlert(id: number): void {
    this.alertsService.delete(id).subscribe({
      next: () => this.loadAlerts()
    });
  }

  /** Obtiene el nombre del producto por su id */
  getProductName(productId: number): string {
    return this.products.find(p => p.id === productId)?.name || '—';
  }

  /** Formatea precio en USD */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}