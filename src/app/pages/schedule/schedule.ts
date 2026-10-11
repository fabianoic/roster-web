import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { EmployeeSummary } from '../../core/common/common.model';
import { EmployeeApi } from '../../core/employees/employee-api';
import { ShiftApi } from '../../core/shifts/shift-api';
import { Shift, ShiftRequest, WeekTeamDay } from '../../core/shifts/shift.model';
import {
  addDays,
  createWeekDays,
  groupByEmployee,
  startOfWeek,
  toIsoDate,
} from '../../core/shifts/week';
import { StoreApi } from '../../core/stores/store-api';
import { StoreSummary } from '../../core/stores/store.model';

@Component({
  selector: 'app-schedule',
  imports: [DatePipe, ReactiveFormsModule],
  styleUrl: './schedule.scss',
  template: `
    <main class="page">
      <h1 class="week-title">
        Week {{ weekStart() | date: 'd' }} to {{ weekEnd() | date: 'd' }} of
        {{ weekStart() | date: 'MMMM' }}
      </h1>
      <button type="button" (click)="changeWeek(-1)">&lt;</button>
      <button type="button" (click)="changeWeek(1)">&gt;</button>
      @if (canCreateShift()) {
        <button type="button" (click)="openForm()">New shift</button>
        @if (formMessage(); as msg) {
          <p>{{ msg }}</p>
        }
      }

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
              <span class="employee-name" [class.me]="isMe(employeeList.employee.id)">{{
                employeeList.employee.name
              }}</span>
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
            <span class="employee-name" [class.me]="isMe(team.employee.id)">{{
              team.employee.name
            }}</span>
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

      <dialog #formDialog (close)="closeForm()">
        <form class="shift-form" [formGroup]="shiftForm" (ngSubmit)="saveShift()">
          <label>
            Choose an employee:
            <select formControlName="employeeId">
              <option value="" disabled selected>Choose an Employee</option>
              @for (employee of employees(); track employee.id) {
                <option [value]="employee.id">{{ employee.name }}</option>
              }
            </select>
          </label>

          <label>
            Choose a store:
            <select formControlName="storeId">
              <option value="" disabled selected>Choose a Store</option>
              @for (store of stores(); track store.id) {
                <option [value]="store.id">{{ store.name }}</option>
              }
            </select>
          </label>

          <label>
            Shift date:
            <input formControlName="shiftDate" type="date" />
          </label>

          <label>
            Start time:
            <input formControlName="startTime" type="time" />
          </label>

          <label>
            End time:
            <input formControlName="endTime" type="time" />
          </label>

          @if (formMessage(); as msg) {
            <p>{{ msg }}</p>
          }

          <button type="submit" [disabled]="shiftForm.invalid || saving()">Create</button>
          <button type="button" (click)="formDialog.close()">Cancel</button>
        </form>
      </dialog>
    </main>
  `,
})
export class Schedule {
  protected readonly auth = inject(AuthService);
  private readonly shiftApi = inject(ShiftApi);
  private readonly employeeApi = inject(EmployeeApi);
  private readonly storeApi = inject(StoreApi);

  protected readonly formBuilder = inject(FormBuilder).nonNullable;

  protected readonly weekStart = signal<Date>(startOfWeek(new Date()));
  protected readonly shifts = signal<Shift[]>([]);
  protected readonly selectedDay = signal<WeekTeamDay | null>(null);
  protected readonly employees = signal<EmployeeSummary[]>([]);
  protected readonly stores = signal<StoreSummary[]>([]);
  protected readonly formMessage = signal<string | null>(null);
  protected readonly saving = signal<boolean>(false);

  protected readonly today = toIsoDate(new Date());
  private readonly dayDialog = viewChild.required<ElementRef<HTMLDialogElement>>('dayDialog');
  private readonly formDialog = viewChild.required<ElementRef<HTMLDialogElement>>('formDialog');

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

  protected openForm() {
    forkJoin([
      this.employeeApi.list({ status: 'ACTIVE', size: 200 }),
      this.storeApi.list({ size: 200 }),
    ]).subscribe({
      next: ([employees, stores]) => {
        this.employees.set(employees.content);
        this.stores.set(stores.content);

        this.formDialog().nativeElement.showModal();
      },
      error: (err) => {
        this.formMessage.set('An error occured');
        console.error('An error occured', err);
      },
    });
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

  protected canCreateShift(): boolean {
    return this.auth.canAll('SHIFT_WRITE', 'EMPLOYEE_READ_ANY', 'STORE_READ');
  }

  protected readonly shiftForm = this.formBuilder.group({
    employeeId: ['', Validators.required],
    storeId: ['', Validators.required],
    shiftDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
  });

  protected saveShift() {
    this.saving.set(true);
    const body: ShiftRequest = this.shiftForm.getRawValue();

    this.shiftApi.create(body).subscribe({
      next: (shift) => {
        this.loadShifts();
        this.formDialog().nativeElement.close();
        this.saving.set(false);
      },
      error: (err) => {
        if (err.status === 409) {
          this.formMessage.set('This employee already has a shift at this time');
        } else if (err.status === 400) {
          this.formMessage.set('Invalid values, check again!');
        } else {
          this.formMessage.set('An unexpected error ocurred ');
        }
        this.saving.set(false);
        console.error('Could not create shift: ', err);
      },
    });
  }

  protected closeForm() {
    this.shiftForm.reset();
    this.formMessage.set(null);
  }

  constructor() {
    this.loadShifts();
  }
}
