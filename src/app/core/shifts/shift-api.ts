import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Page, Shift, ShiftFilter } from './shift.model';
import { Observable } from 'rxjs';

@Service()
export class ShiftApi {
    private readonly http = inject(HttpClient);
    
    list({start, end, employeeId, size }: ShiftFilter): Observable<Page<Shift>> {
        let params = new HttpParams().set('start', start).set('end', end);
        if(employeeId) {
            params = params.set('employeeId', employeeId);
        }
        if(size) {
            params = params.set('size', size);
        }
        
        return this.http.get<Page<Shift>>('/api/shifts', {params});
    }
}
