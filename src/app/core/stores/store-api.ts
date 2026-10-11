import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, StoreFilter, StoreSummary } from './store.model';
import { Page } from '../common/common.model';

@Service()
export class StoreApi {
  private readonly http = inject(HttpClient);

  list({ size }: StoreFilter = {}): Observable<Page<StoreSummary>> {
    let params = new HttpParams();
    if (size) {
      params = params.set('size', size);
    }

    return this.http.get<Page<StoreSummary>>('/api/stores', { params });
  }
}
