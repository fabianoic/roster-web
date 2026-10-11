import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Shift, ShiftFilter, ShiftRequest, UpdateShiftRequest } from './shift.model';
import { Observable } from 'rxjs';
import { Page } from '../common/common.model';

@Service()
export class ShiftApi {
  private readonly http = inject(HttpClient);

  create(shiftRequest: ShiftRequest): Observable<Shift> {
    return this.http.post<Shift>('/api/shifts', shiftRequest);
  }

  list({ start, end, employeeId, size }: ShiftFilter): Observable<Page<Shift>> {
    let params = new HttpParams().set('start', start).set('end', end);
    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    if (size) {
      params = params.set('size', size);
    }

    return this.http.get<Page<Shift>>('/api/shifts', { params });
  }

  update(shiftId: string, updateShiftRequest: UpdateShiftRequest): Observable<Shift> {
    return this.http.put<Shift>(`/api/shifts/${shiftId}`, updateShiftRequest);
  }
}
