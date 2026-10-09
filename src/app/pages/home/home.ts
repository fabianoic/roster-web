import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { DatePipe } from '@angular/common';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift, WeekDay } from '../../core/shifts/shift.model';
import { addDays, startOfWeek, toIsoDate } from '../../core/shifts/week';
import { CreateSwapRequest, EmployeeSummary } from '../../core/swaps/swap.model';
import { SwapApi } from '../../core/swaps/swap-api';
import { HttpErrorResponse } from '@angular/common/http';

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
      <dialog #dayDialog (close)="closeDialog()">
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
            @if (swapShift()) {
              @if (candidates().length) {
                <select (change)="onTargetChange($event)">
                  <option value="" disabled selected>Choose a colleague</option>
                  @for (candidate of candidates(); track candidate.id) {
                    <option [value]="candidate.id">{{ candidate.name }}</option>
                  }
                </select>
                <button type="button" [disabled]="!targetId()" (click)="swapHandleRequest()">Request</button>
              } @else {
                <p>No colleagues available</p>
              }

            }
            @if (swapMessage(); as msg) {
              <p>{{msg}}</p>
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
  private readonly swapApi = inject(SwapApi);
  
  protected readonly shifts = signal<Shift[]>([]);
  protected readonly weekStart = signal<Date>(startOfWeek(new Date()));
  protected readonly selectedDay = signal<WeekDay | null>(null);
  protected readonly swapShift = signal<Shift | null>(null);
  protected readonly candidates = signal<EmployeeSummary[]>([]);
  protected readonly targetId = signal<string | null>(null);
  protected readonly swapMessage = signal<string | null>("");


  private readonly dayDialog = viewChild.required<ElementRef<HTMLDialogElement>>('dayDialog');
  protected readonly today = toIsoDate(new Date());

  private readonly weekEnd = computed(() => addDays(this.weekStart(), 6));
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
    this.swapMessage.set(null);
    this.swapShift.set(shift);
    this.targetId.set(null);
    this.candidates.set([]);
    this.swapApi.candidates(shift.id)
    .subscribe({
      next: (data) => this.candidates.set(data), 
      error: (err: HttpErrorResponse) => {
        this.swapMessage.set("Could not load colleagues");
        console.error("An error occured: " + err.message);
        this.swapShift.set(null);
      }
    });
  }

  protected swapHandleRequest() {
    const body: CreateSwapRequest = {
      requesterId: this.auth.employeeId()!,
      targetId: this.targetId()!
    }
    this.swapApi.create(this.swapShift()!.id, body)
    .subscribe({
      next: (response) => {
        this.swapMessage.set("Swap request sent to " + response.target.name);
        this.swapShift.set(null);
        this.candidates.set([]);
        this.targetId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        if(err.status === 409) {
          this.swapMessage.set("A request for this shift already exists");
        } else {
          this.swapMessage.set("Could not send the request");
          console.error(err);
        }
      }
    });
  }

  protected closeDialog() {
    this.selectedDay.set(null);
    this.swapShift.set(null);
    this.candidates.set([]);
    this.targetId.set(null);
    this.swapMessage.set(null);
  }

  protected onTargetChange(event: Event) {
    const target = (event.target as HTMLSelectElement).value;

    this.targetId.set(target);
  }

  constructor() {
    this.loadShifts();
  }
}
