import { Reason } from './reason.enum'; 

export interface AppointmentDTORequest {
  startTime: string;
  endTime: string;    
  doctor: number;      
  reason: Reason;      
}

export const reasonOptions = [
{ value: Reason.CONTROL, label: 'Chequeo' },
  { value: Reason.VACCINATION, label: 'Vacunación' },
  { value: Reason.EMERGENCY, label: 'Emergencia' },
  { value: Reason.NUTRITION, label: 'Nutrición' }
];
