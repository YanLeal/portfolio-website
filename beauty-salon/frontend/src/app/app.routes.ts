import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Belleza & Estilo — Salón de belleza y estética en Córdoba',
    loadComponent: () => import('./pages/home/home').then((c) => c.HomePage),
  },
  {
    path: '**',
    title: 'Página no encontrada — Belleza & Estilo',
    loadComponent: () => import('./pages/not-found/not-found').then((c) => c.NotFoundPage),
  },
];
