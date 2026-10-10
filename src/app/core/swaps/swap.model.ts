import { EmployeeSummary } from "../common/common.model";
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

