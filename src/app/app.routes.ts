import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth/auth.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', component: Home, canActivate: [permissionGuard('SHIFT_READ')] },
  ]
},
  { path: '**', redirectTo: '' },
];
