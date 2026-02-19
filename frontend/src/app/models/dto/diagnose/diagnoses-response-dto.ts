import { Reason } from '../../enums/reason.enum';
import { PetType } from '../../enums/pet-type.enum';

export interface DiagnosesDTOResponse {
  id: number;
  diagnose: string;
  treatment: string;
  doctorName: string;
  petName: string;
  petType: PetType;
  otherType?: string;
  appointmentReason: Reason;
  clientName?: string;
  appointmentStartTime?: string;
  appointmentEndTime?: string;
  date: string; // ISO string (LocalDateTime) - fecha del diagnóstico
}

