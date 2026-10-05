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
  styleUrl: './home.scss',
  template: `
    <main class="page">
      <h1 class="week-title">Week {{ weekStart() | date: 'd' }} to {{ weekEnd() | date: 'd' }} of {{ weekStart() | date: 'MMMM' }}</h1>
      <button type="button" (click)="changeWeek(-1)">&lt;</button>
      <button type="button" (click)="changeWeek(1)">&gt;</button>
      <div class="days">
        @for (item of days(); track item.date) {
          <section class="day" [class.today]="item.date === today">
            <h2 class="day-title">{{item.date | date: 'EEEE, d MMM'}}</h2>
            @for (shift of item.shifts; track shift.id) {
                <p class="shift">
                  @if (shift.status === 'CANCELED') {CANCELED: }
                  <span [class.canceled]="shift.status === 'CANCELED'">
                    {{shift.startTime.slice(0, 5)}} to {{shift.endTime.slice(0, 5)}} - {{shift.store.name}}
                  </span>
              </p>
            } @empty {
              <p class="day-off">Day Off</p>
            }
          </section>
        }
      </div>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly shiftApi = inject(ShiftApi);

  protected readonly shifts = signal<Shift[]>([]);

  protected readonly weekStart = signal<Date>(startOfWeek(new Date()));

  private readonly weekEnd = computed(() => addDays(this.weekStart(), 6));
  protected readonly today = toIsoDate(new Date());

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
