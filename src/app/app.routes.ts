import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth/auth.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Shell } from './layout/shell/shell';
import { ComingSoon } from './layout/coming-soon/comingsoon';
import { Schedule } from './pages/schedule/schedule';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', component: Home, canActivate: [permissionGuard('SHIFT_READ')] },
      { path: 'schedules', component: Schedule, canActivate: [permissionGuard('SHIFT_READ')] },
      { path: 'team', component: ComingSoon, canActivate: [permissionGuard('EMPLOYEE_READ_ANY')] },
      { path: 'requests', component: ComingSoon, canActivate: [permissionGuard('TIME_OFF_SELF', 'TIME_OFF_ANY', 'TIME_OFF_REVIEW', 'AVAILABILITY_SELF', 'AVAILABILITY_ANY')] },
      { path: 'stores', component: ComingSoon, canActivate: [permissionGuard('STORE_READ')] },
      { path: 'roles', component: ComingSoon, canActivate: [permissionGuard('ROLE_MANAGE')] },
  ]
},
  { path: '**', redirectTo: '' },
];
