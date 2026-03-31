import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;

  // BehaviorSubject recuerda el último valor emitido
  // cuando un componente se suscribe recibe inmediatamente el último precio
  private pricesSubject = new BehaviorSubject<any[]>([]);
  prices$ = this.pricesSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return;

    const token = this.authService.getToken();
    if (!token) return;

    console.log('[WS] Intentando conectar...');
    this.ws = new WebSocket(`${environment.wsUrl}/ws/prices`);

    this.ws.onopen = () => {
      console.log('[WS] Conectado, enviando token...');
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(token);
          console.log('[WS] Token enviado');
        }
      }, 100);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'prices') {
        // Guarda el último valor en el BehaviorSubject
        this.pricesSubject.next(data.data);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[WS] Desconectado (código: ${event.code})`);
      this.ws = null;
      if (event.code !== 1000 && event.code !== 4001 && event.code !== 1001) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error);
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Cierre intencional');
      this.ws = null;
    }
  }
}