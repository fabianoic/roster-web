import { Component, computed, inject, signal } from "@angular/core";
import { ShiftApi } from "../../core/shifts/shift-api";
import { Shift, ShiftFilter } from "../../core/shifts/shift.model";
import { addDays, startOfWeek, toIsoDate } from "../../core/shifts/week";
import { JsonPipe } from "@angular/common";

@Component({
    selector: 'app-schedule',
    imports: [JsonPipe],
    styleUrl: './schedule.scss',
    template: `
        <h1>Team Schedule</h1>
        <pre>{{ shifts() | json }}</pre>
        `
})
export class Schedule {
    private readonly shiftApi = inject(ShiftApi);
    protected readonly weekStart = signal<Date>(startOfWeek(new Date()));
    
    private readonly weekEnd = computed(() => addDays(this.weekStart(), 6));

    protected readonly shifts = signal<Shift[]>([]);

  protected loadShifts() {
    this.shiftApi
      .list({
        start: toIsoDate(this.weekStart()),
        end: toIsoDate(this.weekEnd()),
        size: 200
      })
      .subscribe((page) => this.shifts.set(page.content));
  }

  constructor() {
    this.loadShifts();
  }
}