import { TestBed } from '@angular/core/testing';
import { ShiftApi } from './shift-api';

describe('ShiftApi', () => {
  let service: ShiftApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiftApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
