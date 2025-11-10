import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentDoctorHistory } from './appointment-doctor-history';

describe('AppointmentDoctorHistory', () => {
  let component: AppointmentDoctorHistory;
  let fixture: ComponentFixture<AppointmentDoctorHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentDoctorHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentDoctorHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
