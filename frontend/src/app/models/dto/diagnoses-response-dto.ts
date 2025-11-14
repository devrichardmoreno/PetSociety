import { Reason } from './reason.enum';
import { PetType } from './pet-type.enum';

export interface DiagnosesDTOResponse {
  diagnose: string;
  treatment: string;
  doctorName: string;
  petName: string;
  petType: PetType;
  otherType?: string;
  appointmentReason: Reason;
  date: string; // ISO string (LocalDateTime) - fecha del diagnóstico
}

