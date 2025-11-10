import { Reason } from './reason.enum';
import { Speciality } from './speciality.enum';
import { Status } from './status.enum';

export interface AppointmentHistoryDTO {
  appointmentId: number;
  startTime: string;
  endTime: string;
  doctorName: string;
  doctorId: number;
  doctorSpeciality: Speciality;
  petName: string;
  petId: number;
  reason: Reason;
  status: Status;
  hasDiagnosis: boolean;
  diagnosisId: number | null;
}

