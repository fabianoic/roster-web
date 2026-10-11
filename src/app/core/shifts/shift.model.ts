import { EmployeeSummary } from "../common/common.model";

export interface Shift {
    id: string;
    employee: EmployeeSummary;
    store: { id: string; name: string };
    shiftDate: string;
    startTime: string;
    endTime: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
}

export interface WeekDay {
    date: string;
    shifts: Shift[];
}

export interface Page<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface ShiftFilter {
    start: string;
    end: string;
    employeeId?: string;
    size?: number;
}

export interface EmployeeShifts {
    employee: EmployeeSummary;
    shifts: Shift[];
}

export interface WeekTeamDay {
    date: string;
    employees: EmployeeShifts[];
}