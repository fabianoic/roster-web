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

export interface ShiftRequest {
    employeeId: string;
    storeId: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
}

export interface WeekDay {
    date: string;
    shifts: Shift[];
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

export interface UpdateShiftRequest {
    storeId: string;
    startTime: string;
    endTime: string;
    status: Shift['status']
}

export interface UpdateShiftEmployeeRequest {
    employeeId: string;
}