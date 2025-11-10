import { Reason } from './reason.enum';

export interface DiagnosesDTOResponse {
  diagnose: string;
  treatment: string;
  doctorName: string;
  petName: string;
  appointmentReason: Reason;
  date: string; // ISO string (LocalDateTime) - fecha del diagnóstico
}

