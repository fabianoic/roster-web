import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { JsonPipe } from '@angular/common';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift } from '../../core/shifts/shift.model';

/** Tela provisória: só confirma que o login funcionou. Vira a semana na Etapa 4. */
@Component({
  selector: 'app-home',
  imports: [JsonPipe],
  template: `
    <main style="padding: 24px">
      <h1>My shifts</h1>
      <pre>{{ shifts() | json }}</pre>
      <button type="button" (click)="auth.logout()">Sign out</button>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly shiftApi = inject(ShiftApi);

  protected readonly shifts = signal<Shift[]>([]);

  constructor() {
    this.shiftApi
      .list(this.auth.employeeId()!, '2026-09-01', '2026-09-30')
      .subscribe((page) => this.shifts.set(page.content));
  }
}
