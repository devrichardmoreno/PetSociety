import { Reason } from './reason.enum';

export interface DoctorAvailabilityDTO {
  start: string;  
  end: string;     
  reason: Reason;
}