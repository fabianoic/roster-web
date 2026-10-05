import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { DatePipe } from '@angular/common';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift, WeekDay } from '../../core/shifts/shift.model';
import { addDays, startOfWeek, toIsoDate } from '../../core/shifts/week';

/** Tela provisória: só confirma que o login funcionou. Vira a semana na Etapa 4. */
@Component({
  selector: 'app-home',
  imports: [DatePipe],
  template: `
    <main style="padding: 24px">
      <h1>My shifts</h1>
      <h2>Week {{ weekStart() | date: 'd' }} to {{ weekEnd() | date: 'd' }} of {{ weekStart() | date: 'MMMM' }}</h2>
      <button type="button" (click)="changeWeek(-1)">&lt;</button>
      <button type="button" (click)="changeWeek(1)">&gt;</button>
      @for (item of days(); track item.date) {
        <section>
          <h2>{{item.date | date: 'EEEE, d MMM'}}</h2>
          @for (shift of item.shifts; track shift.id) {
            <p>{{shift.startTime.slice(0, 5)}} to {{shift.endTime.slice(0, 5)}} - {{shift.store.name}}</p>
          } @empty {
            <p>Day Off</p>
          }
        </section>
      }
      <button type="button" (click)="auth.logout()">Sign out</button>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly shiftApi = inject(ShiftApi);

  protected readonly shifts = signal<Shift[]>([]);

  protected readonly weekStart = signal<Date>(startOfWeek(new Date()));

  private readonly weekEnd = computed(() => addDays(this.weekStart(), 6));

  protected readonly days = computed<WeekDay[]>(() => {
    const start = this.weekStart();
    const weekShifts = this.shifts(); 
    return Array.from({length: 7}, (_, i) => {
      const iso = toIsoDate(addDays(start, i));
      return { date: iso, shifts: weekShifts.filter(s => s.shiftDate === iso) };
    });
  });

  private loadShifts() {
    this.shiftApi
      .list(this.auth.employeeId()!, toIsoDate(this.weekStart()), toIsoDate(this.weekEnd()))
      .subscribe((page) => this.shifts.set(page.content));
  }

  private changeWeek(offset: number) {
    this.weekStart.update(d => addDays(d, offset * 7));
    this.loadShifts();
  }

  constructor() {
    this.loadShifts();
  }
}
