import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'callback',
    loadComponent: () => import('./core/callback/callback.component').then(m => m.CallbackComponent),
  },
  {
    path: 'workspace',
    loadComponent: () => import('./features/workspace/workspace.component').then(m => m.WorkspaceComponent),
    canActivate: [authGuard],
  },
  {
    path: 'upload',
    loadComponent: () => import('./features/upload/upload.component').then(m => m.UploadComponent),
    canActivate: [authGuard],
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'workspace', pathMatch: 'full' },
  { path: '**', redirectTo: 'workspace' },
];
