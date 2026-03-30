/**
 * AuthService
 * -----------
 * Maneja el registro, login y estado de autenticación del usuario.
 * Guarda el token JWT en localStorage y expone el usuario actual
 * como un Observable para que los componentes reaccionen a cambios.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  // BehaviorSubject mantiene el último valor emitido.
  // Los componentes se suscriben a currentUser$ para saber quién está logueado.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Al iniciar, verificar si hay un token guardado
    this.loadUserFromToken();
  }

  /** Registra un nuevo usuario */
  register(email: string, username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, {
      email, username, password
    });
  }

  /** Inicia sesión y guarda el token en localStorage */
  login(email: string, password: string): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/auth/login`, {
      email, password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        this.decodeAndSetUser(response.access_token);
      })
    );
  }

  /** Cierra sesión y redirige al login */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /** Retorna el token guardado en localStorage */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Verifica si el usuario está autenticado */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Verifica si el usuario tiene rol admin */
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  /** Decodifica el token JWT y obtiene los datos del usuario */
  private decodeAndSetUser(token: string): void {
    try {
      // El payload del JWT está en la segunda parte (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Obtener datos del usuario desde el backend
      this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    } catch {
      this.logout();
    }
  }

  /** Carga el usuario desde el token guardado al iniciar la app */
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }
}