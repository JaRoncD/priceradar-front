/**
 * ProductsService
 * ---------------
 * Maneja todas las operaciones relacionadas con productos (criptomonedas).
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: number;
  coin_id: string;
  name: string;
  symbol: string;
  current_price: number | null;
  last_updated: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products/`;

  constructor(private http: HttpClient) {}

  /** Lista todos los productos del sistema */
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /** Agrega un producto (solo admin) */
  add(coinId: string): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, { coin_id: coinId });
  }

  /** Actualiza un producto (solo admin) */
  update(id: number, data: { name?: string; symbol?: string }): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  /** Elimina un producto (solo admin) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Historial de precios de un producto */
  getHistory(id: number, limit = 100): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history?limit=${limit}`);
  }
}