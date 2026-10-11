export interface EmployeeSummary {
    id: string;
    name: string;
}

export interface Page<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}