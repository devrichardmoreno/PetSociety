import { Reason } from '../../enums/reason.enum';

export interface DoctorAvailabilityDTO {
  start: string;  
  end: string;     
  reason: Reason;
  minHour?: string; // Hora mínima en formato "HH:mm" para la franja horaria
  maxHour?: string; // Hora máxima en formato "HH:mm" para la franja horaria
}