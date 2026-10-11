import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { EmployeeSummary, Page } from '../common/common.model';
import { Employee, EmployeeFilter } from './employee.model';
import { Observable } from 'rxjs';

@Service()
export class EmployeeApi {
  private readonly http = inject(HttpClient);

  list({ status, size }: EmployeeFilter = {}): Observable<Page<EmployeeSummary>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if(size) {
        params = params.set('size', size);
    }
    return this.http.get<Page<EmployeeSummary>>('/api/employees', { params });
  }
}
