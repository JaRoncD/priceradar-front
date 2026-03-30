/**
 * AuthInterceptor
 * ---------------
 * Intercepta todas las peticiones HTTP salientes y agrega
 * el token JWT en el header Authorization automáticamente.
 * Así no tienes que agregar el token manualmente en cada servicio.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si hay token, clona el request y agrega el header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Si no hay token, deja pasar el request sin modificar
  return next(req);
};