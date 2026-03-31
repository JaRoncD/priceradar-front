/**
 * DashboardComponent
 * ------------------
 * Página principal que muestra los precios en tiempo real
 * de todas las criptomonedas via WebSocket.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../core/services/websocket.service';
import { ProductsService, Product } from '../../core/services/products.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  prices: any[] = [];
  products: Product[] = [];
  connected = false;
  private sub: Subscription | null = null;

  constructor(
    private wsService: WebsocketService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    // Cargar productos desde la API
    this.productsService.getAll().subscribe({
      next: (data) => this.products = data
    });

    // Conectar WebSocket y suscribirse a precios
    this.wsService.connect();
    this.connected = true;

    this.sub = this.wsService.prices$.subscribe(prices => {
      this.prices = prices;
      console.log('[Dashboard] Precios recibidos:', prices); // ← debug temporal
    });
  }
  ngOnDestroy(): void {
    // Solo cancelar la suscripción, NO desconectar el WebSocket
    this.sub?.unsubscribe();
  }

  /** Busca el precio actual de un producto por su coin_id */
  getPriceData(coinId: string): any {
    return this.prices.find(p => p.coin_id === coinId);
  }

  /** Formatea el precio en USD */
  formatPrice(price: number | null): string {
    if (!price) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}