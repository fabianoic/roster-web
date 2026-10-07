import { Shift } from "../shifts/shift.model";

export interface CreateSwapRequest {
    requesterId: string;
    targetId: string;
}

export interface ShiftSwap {
    id: string;
    shift: Shift;
    requester: EmployeeSummary;
    target: EmployeeSummary;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface EmployeeSummary {
    id: string;
    name: string;
}

