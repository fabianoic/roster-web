import { TestBed } from '@angular/core/testing';
import { StoreApi } from './store-api';

describe('StoreApi', () => {
  let service: StoreApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
