import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
  {
    path: '',
    loadComponent: () => import('./layout/layout/layout').then((m) => m.Layout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'inventory', loadComponent: () => import('./features/inventory/inventory-list/inventory-list').then((m) => m.InventoryList) },
      { path: 'shopping-list', loadComponent: () => import('./features/shopping-list/shopping-list').then((m) => m.ShoppingList) },
      { path: 'analytics', loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder), data: { title: 'Analytics', icon: 'analytics', message: 'Analytics features coming soon!' } },
      { path: 'settings', loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder), data: { title: 'Settings', icon: 'settings', message: 'Settings will be available soon!' } },
    ],
  },
];
