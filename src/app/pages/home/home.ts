import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { JsonPipe } from '@angular/common';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift, WeekDay } from '../../core/shifts/shift.model';
import { addDays, startOfWeek, toIsoDate } from '../../core/shifts/week';

/** Tela provisória: só confirma que o login funcionou. Vira a semana na Etapa 4. */
@Component({
  selector: 'app-home',
  imports: [JsonPipe],
  template: `
    <main style="padding: 24px">
      <h1>My shifts</h1>
      <pre>{{ days() | json }}</pre>
      <button type="button" (click)="auth.logout()">Sign out</button>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly shiftApi = inject(ShiftApi);

  protected readonly shifts = signal<Shift[]>([]);

  protected readonly weekStart = signal<Date>(startOfWeek(new Date(2026, 8, 5)));

  protected readonly days = computed<WeekDay[]>(() => {
    const start = this.weekStart();
    const weekShifts = this.shifts(); 
    return Array.from({length: 7}, (_, i) => {
      const iso = toIsoDate(addDays(start, i));
      return { date: iso, shifts: weekShifts.filter(s => s.shiftDate === iso) };
    });
  });

  constructor() {
    this.shiftApi
      .list(this.auth.employeeId()!, toIsoDate(this.weekStart()), toIsoDate(addDays(this.weekStart(), 6)))
      .subscribe((page) => this.shifts.set(page.content));
  }
}
