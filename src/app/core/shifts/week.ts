import { EmployeeShifts, Shift, WeekDay } from './shift.model';

export function startOfWeek(date: Date): Date {
  const startDayOfWeek = new Date(date);

  const dayOfWeek = (startDayOfWeek.getDay() + 1) % 7;
  startDayOfWeek.setDate(startDayOfWeek.getDate() - dayOfWeek);
  return startDayOfWeek;
}

export function toIsoDate(date: Date): string {
  const result = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  return result;
}

export function addDays(date: Date, days: number): Date {
  const dateToAddDays = new Date(date);

  dateToAddDays.setDate(dateToAddDays.getDate() + days);
  return dateToAddDays;
}

export function createWeekDays(date: Date, shifts: Shift[]): WeekDay[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const iso = toIsoDate(addDays(start, i));
    return { date: iso, shifts: shifts.filter((s) => s.shiftDate === iso) };
  });
}

export function groupByEmployee(shifts: Shift[]): EmployeeShifts[] {
  const grouped = new Map<string, EmployeeShifts>();
  for (const shift of shifts) {
    const employeeShifts = grouped.get(shift.employee.id);

    if (employeeShifts) {
      employeeShifts.shifts.push(shift);
    } else {
      grouped.set(shift.employee.id, {
        employee: shift.employee,
        shifts: [shift],
      });
    }
  }

  return Array.from(grouped.values());
}
