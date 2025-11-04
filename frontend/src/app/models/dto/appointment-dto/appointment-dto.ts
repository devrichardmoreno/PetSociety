
import dayjs from 'dayjs';

export interface AppointmentDto {
    startTime: string;
    diagnose: string;
    treatment: string;
    doctorName: string;
    clientName: string;
    petName: string;
    reason: string;
}

export function mapAppointmentDateToDate(dto: AppointmentDto) {
    return {
        ...dto,
        date: dayjs(dto.startTime).toDate() 
    } as AppointmentDto & { date: Date };
}
