import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NAV_ITEMS } from '../nav-items';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html'
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly visibleItems = computed(() => NAV_ITEMS.filter(item => item.anyOf.some(p => this.auth.can(p))));
}
