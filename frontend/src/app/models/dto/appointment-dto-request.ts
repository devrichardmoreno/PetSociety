import { Reason } from './reason.enum'; 

export interface AppointmentDTORequest {
  startTime: string;
  endTime: string;    
  doctor: number;      
  reason: Reason;      
}

export const reasonOptions = [
  { value: Reason.CHECKUP, label: 'Chequeo' },
  { value: Reason.VACCINATION, label: 'Vacunacion' },
  { value: Reason.SURGERY, label: 'Cirugia' }
];
