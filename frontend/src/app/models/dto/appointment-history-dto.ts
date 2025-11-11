import { Reason } from './reason.enum';
import { Speciality } from './speciality.enum';
import { Status } from './status.enum';
import { PetType } from './pet-type.enum';

export interface AppointmentHistoryDTO {
  appointmentId: number;
  startTime: string;
  endTime: string;
  doctorName: string;
  doctorId: number;
  doctorSpeciality: Speciality;
  petName: string;
  petId: number;
  petType: PetType;
  otherType?: string;
  reason: Reason;
  status: Status;
  hasDiagnosis: boolean;
  diagnosisId: number | null;
}

