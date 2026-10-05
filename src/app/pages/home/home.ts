import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

/** Tela provisória: só confirma que o login funcionou. Vira a semana na Etapa 4. */
@Component({
  selector: 'app-home',
  template: `
    <main style="padding: 24px">
      <h1>Signed in</h1>
      <p>{{ auth.email() }} · {{ auth.role() }}</p>
      <p>{{ auth.permissions().length }} permissions in the token</p>
      <button type="button" (click)="auth.logout()">Sign out</button>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
}
