import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export interface AppointmentDto {
    id: number;
    startTime: string;
    endTime: string;
    diagnose: string;
    treatment: string;
    doctorName: string;
    clientName: string;
    petName: string;
    reason: string;
}

export function mapAppointmentDateToDate(dto: AppointmentDto) {
  const start = dto.startTime ? dayjs.utc(dto.startTime).local() : null;
  const end = dto.endTime ? dayjs.utc(dto.endTime).local() : null;

  return {
    ...dto,
    startDate: start?.isValid() ? start.toDate() : null,
    endDate: end?.isValid() ? end.toDate() : null,
  } as AppointmentDto & { startDate: Date | null; endDate: Date | null };
}

