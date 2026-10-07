import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { DatePipe } from '@angular/common';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift, WeekDay } from '../../core/shifts/shift.model';
import { addDays, startOfWeek, toIsoDate } from '../../core/shifts/week';
import { CreateSwapRequest } from '../../core/swaps/swap.model';
import { SwapApi } from '../../core/swaps/swap-api';

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
          <button type="button" class="day" [class.today]="item.date === today" (click)="openDay(item)">
            <span class="day-title">{{item.date | date: 'EEEE, d MMM'}}</span>
            @for (shift of item.shifts; track shift.id) {
                <span class="shift">
                  @if (shift.status === 'CANCELED') {CANCELED: }
                  <span [class.canceled]="shift.status === 'CANCELED'">
                    {{shift.startTime.slice(0, 5)}} to {{shift.endTime.slice(0, 5)}} - {{shift.store.name}}
                  </span>
            </span>
            } @empty {
              <p class="day-off">Day Off</p>
            }
          </button>
        }
      </div>
      <dialog #dayDialog (close)="selectedDay.set(null)">
          @if (selectedDay(); as day) {
            <h2 class="day-title">{{day.date | date: 'EEEE, d MMM'}}</h2>
            @for (shift of day.shifts; track shift.id) {
                <p class="shift">
                  @if (shift.status === 'CANCELED') {CANCELED: }
                  <span [class.canceled]="shift.status === 'CANCELED'">
                    {{shift.startTime.slice(0, 5)}} to {{shift.endTime.slice(0, 5)}} - {{shift.store.name}}
                  </span>
                  @if (shift.status === 'SCHEDULED' && auth.can('SWAP_REQUEST_SELF')) {
                    <button type="button" (click)="swapHandle(shift)">Swap</button>
                  }
              </p>
            } @empty {
              <p class="day-off">Day Off</p>
            }
              <button type="button" (click)="dayDialog.close()">Close</button>
          }  
        </dialog>
    </main>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly shiftApi = inject(ShiftApi);
  private readonly SwapApi = inject(SwapApi);
  private readonly dayDialog = viewChild.required<ElementRef<HTMLDialogElement>>('dayDialog');
  protected readonly shifts = signal<Shift[]>([]);

  protected readonly weekStart = signal<Date>(startOfWeek(new Date()));

  protected readonly selectedDay = signal<WeekDay | null>(null);

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

  protected loadShifts() {
    this.shiftApi
      .list(this.auth.employeeId()!, toIsoDate(this.weekStart()), toIsoDate(this.weekEnd()))
      .subscribe((page) => this.shifts.set(page.content));
  }

  protected changeWeek(offset: number) {
    this.weekStart.update(d => addDays(d, offset * 7));
    this.loadShifts();
  }

  protected openDay(day: WeekDay) {
    this.selectedDay.set(day);
    this.dayDialog().nativeElement.showModal();
  }

  protected swapHandle(shift: Shift) {
    const body: CreateSwapRequest = {
      requesterId: this.auth.employeeId()!,
      //temporary target
      targetId: '694fcdda-827b-4be9-945a-ff424adeb214'
    }
    this.SwapApi.create(shift.id, body)
    .subscribe(r => console.log(r));
  }

  constructor() {
    this.loadShifts();
  }
}
