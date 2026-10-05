export function startOfWeek(date: Date): Date {
    const startDayOfWeek = new Date(date);

    const dayOfWeek = (startDayOfWeek.getDay() +1) % 7;
    startDayOfWeek.setDate(startDayOfWeek.getDate() - dayOfWeek);
    return startDayOfWeek;
}

export function toIsoDate(date: Date): string {
    const result = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    return result;
}

export function addDays(date: Date, days: number): Date {
    const dateToAddDays = new Date(date);

    dateToAddDays.setDate(dateToAddDays.getDate() + days);
    return dateToAddDays;
}