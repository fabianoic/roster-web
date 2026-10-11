import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift, WeekTeamDay } from '../../core/shifts/shift.model';
import {
  addDays,
  createWeekDays,
  groupByEmployee,
  startOfWeek,
  toIsoDate,
} from '../../core/shifts/week';

@Component({
  selector: 'app-schedule',
  imports: [DatePipe],
  styleUrl: './schedule.scss',
  template: `
    <main class="page">
      <h1 class="week-title">
        Week {{ weekStart() | date: 'd' }} to {{ weekEnd() | date: 'd' }} of
        {{ weekStart() | date: 'MMMM' }}
      </h1>
      <button type="button" (click)="changeWeek(-1)">&lt;</button>
      <button type="button" (click)="changeWeek(1)">&gt;</button>
      <div class="days">
        @for (item of teamDays(); track item.date) {
          <button
            type="button"
            class="day"
            [class.today]="item.date === today"
            (click)="openDay(item)"
          >
            <span class="day-title">{{ item.date | date: 'EEE, d MMM' }}</span>
            @for (employeeList of item.employees; track employeeList.employee.id) {
              <span class="employee-name"  [class.me]="isMe(employeeList.employee.id)">{{ employeeList.employee.name }}</span>
              @for (shift of employeeList.shifts; track shift.id) {
                <span class="shift" [class.my-shift]="isMe(employeeList.employee.id)">
                  <span [class.canceled]="shift.status === 'CANCELED'">
                    {{ shift.startTime.slice(0, 5) }} to {{ shift.endTime.slice(0, 5) }}
                  </span>
                </span>
              }
            } @empty {
              <span class="day-off">No shifts</span>
            }
          </button>
        }
      </div>
      <dialog #dayDialog (close)="selectedDay.set(null)">
        @if (selectedDay(); as day) {
          <h2 class="day-title">{{ day.date | date: 'EEEE, d MMM' }}</h2>
          @for (team of day.employees; track team.employee.id) {
            <span class="employee-name" [class.me]="isMe(team.employee.id)">{{ team.employee.name }}</span>
            @for (shift of team.shifts; track shift.id) {
              <p class="shift" [class.my-shift]="isMe(team.employee.id)">
                @if (shift.status === 'CANCELED') {
                  CANCELED:
                }
                <span [class.canceled]="shift.status === 'CANCELED'">
                  {{ shift.startTime.slice(0, 5) }} to {{ shift.endTime.slice(0, 5) }} -
                  {{ shift.store.name }}
                </span>
              </p>
            }
          } @empty {
            <p class="day-off">No Shift</p>
          }
          <button type="button" (click)="dayDialog.close()">Close</button>
        }
      </dialog>
    </main>
  `,
})
export class Schedule {
  protected readonly auth = inject(AuthService);
  private readonly shiftApi = inject(ShiftApi);

  protected readonly weekStart = signal<Date>(startOfWeek(new Date()));
  protected readonly shifts = signal<Shift[]>([]);
  protected readonly selectedDay = signal<WeekTeamDay | null>(null);

  protected readonly today = toIsoDate(new Date());
  private readonly dayDialog = viewChild.required<ElementRef<HTMLDialogElement>>('dayDialog');

  private readonly weekEnd = computed(() => addDays(this.weekStart(), 6));
  protected readonly days = computed(() => createWeekDays(this.weekStart(), this.shifts()));
  protected readonly teamDays = computed(() =>
    this.days().map((day) => ({ date: day.date, employees: groupByEmployee(day.shifts) })),
  );

  protected changeWeek(offset: number) {
    this.weekStart.update((d) => addDays(d, offset * 7));
    this.loadShifts();
  }

  protected openDay(day: WeekTeamDay) {
    this.selectedDay.set(day);
    this.dayDialog().nativeElement.showModal();
  }

  protected loadShifts() {
    this.shiftApi
      .list({
        start: toIsoDate(this.weekStart()),
        end: toIsoDate(this.weekEnd()),
        size: 200,
      })
      .subscribe((page) => this.shifts.set(page.content));
  }

  protected isMe(id: string): boolean {
    return this.auth.employeeId() === id;
  }

  constructor() {
    this.loadShifts();
  }
}
