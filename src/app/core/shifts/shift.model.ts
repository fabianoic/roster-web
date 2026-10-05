export interface Shift {
    id: string;
    employee: { id: string; name: string };
    store: { id: string; name: string };
    shiftDate: string;
    startTime: string;
    endTime: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
}

export interface Page<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}