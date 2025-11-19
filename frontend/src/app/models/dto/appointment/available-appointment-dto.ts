import { Reason } from '../../enums/reason.enum';
import { Speciality } from '../../enums/speciality.enum';

export interface AvailableAppointmentDTO {
  appointmentId: number;
  startTime: string; // ISO string (LocalDateTime)
  endTime: string; // ISO string (LocalDateTime)
  doctorName: string;
  doctorId: number;
  doctorSpeciality: Speciality;
  reason: Reason;
}

