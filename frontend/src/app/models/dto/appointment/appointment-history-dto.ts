import dayjs from 'dayjs';
import { Reason } from '../../enums/reason.enum';
import { Speciality } from '../../enums/speciality.enum';
import { Status } from '../../enums/status.enum';
import { PetType } from '../../enums/pet-type.enum';

export interface AppointmentHistoryDTO {
  appointmentId: number;
  startTime: string;
  endTime: string;
  doctorName: string;
  doctorId: number;
  doctorSpeciality: Speciality;
  clientName: string;
  petName: string;
  petId: number;
  petType: PetType;
  otherType?: string;
  reason: Reason;
  status: Status;
  hasDiagnosis: boolean;
  diagnosisId: number | null;
}

export function mapAppointmentDateToDate(dto: AppointmentHistoryDTO) {
  const start = dto.startTime ? dayjs(dto.startTime).local() : null;
  const end = dto.endTime ? dayjs(dto.endTime).local() : null;

  return {
    ...dto,
    startDate: start?.isValid() ? start.toDate() : null,
    endDate: end?.isValid() ? end.toDate() : null,
  } as AppointmentHistoryDTO & { startDate: Date | null; endDate: Date | null };
}