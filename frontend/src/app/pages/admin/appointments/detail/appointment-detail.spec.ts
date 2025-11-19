import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppointmentDetail } from './appointment-detail';
import { AppointmentService } from '../../../services/appointment/appointment.service';

describe('AppointmentDetail', () => {
  let component: AppointmentDetail;
  let fixture: ComponentFixture<AppointmentDetail>;
  let mockAppointmentService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockAppointmentService = {
      getAppointmentById: jasmine.createSpy('getAppointmentById').and.returnValue(of({ id: 1, aproved: false })),
      approveAppointment: jasmine.createSpy('approveAppointment').and.returnValue(of(null)),
      disapproveAppointment: jasmine.createSpy('disapproveAppointment').and.returnValue(of(null))
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => '1'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentDetail],
      providers: [
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call approveAppointment and set appointment as approved', () => {
    component.approveAppointment();
    expect(mockAppointmentService.approveAppointment).toHaveBeenCalledWith(1);
    expect(component.appointment!.aproved).toBe(true);
  });

  it('should call disapproveAppointment and set appointment as not approved', () => {
    component.appointment!.aproved = true;
    component.disapproveAppointment();
    expect(mockAppointmentService.disapproveAppointment).toHaveBeenCalledWith(1);
    expect(component.appointment!.aproved).toBe(false);
  });
});
