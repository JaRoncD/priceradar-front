/**
 * AlertsService
 * -------------
 * Maneja las alertas de precio del usuario autenticado.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Alert {
  id: number;
  product_id: number;
  target_price: number;
  condition: string;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export interface AlertCreate {
  product_id: number;
  target_price: number;
  condition: 'above' | 'below';
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) {}

  /** Lista las alertas del usuario autenticado */
  getMyAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/me`);
  }

  /** Crea una nueva alerta */
  create(data: AlertCreate): Observable<Alert> {
    return this.http.post<Alert>(this.apiUrl, data);
  }

  /** Elimina una alerta */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}