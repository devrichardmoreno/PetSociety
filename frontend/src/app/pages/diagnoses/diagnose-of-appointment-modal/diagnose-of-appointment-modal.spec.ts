import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnoseOfAppointmentModal } from './diagnose-of-appointment-modal';

describe('DiagnoseOfAppointmentModal', () => {
  let component: DiagnoseOfAppointmentModal;
  let fixture: ComponentFixture<DiagnoseOfAppointmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnoseOfAppointmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnoseOfAppointmentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
