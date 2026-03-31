import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Ruta raíz → redirige al login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Rutas públicas
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent)
  },

  // Rutas privadas
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'alerts',
    loadComponent: () =>
      import('./pages/alerts/alerts').then(m => m.AlertsComponent),
    canActivate: [authGuard]
  },

  // Rutas de admin
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },

  // Ruta no encontrada
  {
    path: '**',
    redirectTo: 'login'
  }
];