import { TestBed } from '@angular/core/testing';

import { DiagnosesService } from './diagnoses-service';

describe('DiagnosesService', () => {
  let service: DiagnosesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagnosesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
