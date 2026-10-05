import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { JsonPipe } from '@angular/common';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift } from '../../core/shifts/shift.model';
import { addDays, startOfWeek, toIsoDate } from '../../core/shifts/week';

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
    const saturdayDate = startOfWeek(new Date());    
    this.shiftApi
      .list(this.auth.employeeId()!, toIsoDate(saturdayDate), toIsoDate(addDays(saturdayDate, 6)))
      .subscribe((page) => this.shifts.set(page.content));
  }
}
