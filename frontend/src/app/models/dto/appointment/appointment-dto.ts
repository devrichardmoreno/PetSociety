import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PetType } from '../../enums/pet-type.enum';
dayjs.extend(utc);

export interface AppointmentDto {
    id: number;
    startTime: string;
    endTime: string;
    diagnose: string;
    treatment: string;
    doctorName: string;
    clientName: string;
    petId: number;
    petName: string;
    petType?: PetType;
    otherType?: string;
    reason: string;
    hasDiagnose?: boolean;
    diagnosisId?: number;
}

export function mapAppointmentDateToDate(dto: AppointmentDto) {
  const start = dto.startTime ? dayjs(dto.startTime).local() : null;
  const end = dto.endTime ? dayjs(dto.endTime).local() : null;

  return {
    ...dto,
    startDate: start?.isValid() ? start.toDate() : null,
    endDate: end?.isValid() ? end.toDate() : null,
  } as AppointmentDto & { startDate: Date | null; endDate: Date | null };
}

