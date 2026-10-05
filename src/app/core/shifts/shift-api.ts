import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Page, Shift } from './shift.model';
import { Observable } from 'rxjs';

@Service()
export class ShiftApi {
    private readonly http = inject(HttpClient);
    
    list(employeeId: string, start: string, end: string): Observable<Page<Shift>> {
        return this.http.get<Page<Shift>>('/api/shifts', {
            params: { employeeId, start, end, size: 100 },
        });
    }
}
