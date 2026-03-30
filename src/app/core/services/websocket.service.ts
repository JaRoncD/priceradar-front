/**
 * WebsocketService
 * ----------------
 * Gestiona la conexión WebSocket con el backend.
 * Envía el token JWT como primer mensaje para autenticarse
 * y emite los precios recibidos como un Observable.
 */
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private ws: WebSocket | null = null;
  private pricesSubject = new Subject<any[]>();

  /** Observable al que se suscriben los componentes para recibir precios */
  prices$ = this.pricesSubject.asObservable();

  constructor(private authService: AuthService) {}

  /** Conecta al WebSocket y envía el token JWT */
  connect(): void {
    if (this.ws) return; // evitar conexiones duplicadas

    const token = this.authService.getToken();
    if (!token) return;

    this.ws = new WebSocket(`${environment.wsUrl}/ws/prices`);

    this.ws.onopen = () => {
      console.log('[WS] Conectado, enviando token...');
      this.ws!.send(token);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'prices') {
        this.pricesSubject.next(data.data);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Desconectado');
      this.ws = null;
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error);
    };
  }

  /** Desconecta el WebSocket */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}