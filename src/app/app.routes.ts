import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth/auth.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Shell } from './layout/shell/shell';
import { ComingSoon } from './layout/coming-soon/comingsoon';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', component: Home, canActivate: [permissionGuard('SHIFT_READ')] },
      { path: 'schedules', component: ComingSoon, canActivate: [permissionGuard('SHIFT_WRITE')] },
      { path: 'team', component: ComingSoon, canActivate: [permissionGuard('EMPLOYEE_READ_ANY')] },
      { path: 'requests', component: ComingSoon, canActivate: [permissionGuard('TIME_OFF_SELF'), permissionGuard('TIME_OFF_ANY'), permissionGuard('TIME_OFF_REVIEW'), permissionGuard('AVAILABILITY_SELF'), permissionGuard('AVAILABILITY_ANY')] },
      { path: 'stores', component: ComingSoon, canActivate: [permissionGuard('STORE_READ')] },
      { path: 'roles', component: ComingSoon, canActivate: [permissionGuard('ROLE_MANAGE')] },
  ]
},
  { path: '**', redirectTo: '' },
];
