import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateSwapRequest, EmployeeSummary, ShiftSwap } from './swap.model';

@Service()
export class SwapApi {
    private readonly http = inject(HttpClient);
    
    create(shiftId: string, body: CreateSwapRequest): Observable<ShiftSwap> {
         return this.http.post<ShiftSwap>(`/api/shifts/${shiftId}/swap-requests`, body);
    }

    candidates(shiftId: string): Observable<EmployeeSummary[]> {
        return this.http.get<EmployeeSummary[]>(`/api/shifts/${shiftId}/swap-candidates`);
    }
}
