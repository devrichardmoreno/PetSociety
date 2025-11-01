
import dayjs from 'dayjs';

export interface AppointmentDto {
    diagnose: string;
    treatment: string;
    doctorName: string;
    petName: string;
    reason: string;
    date: string;
}




export function mapAppointmentDateToDate(dto: AppointmentDto) {
    return {
        ...dto,
        date: dayjs(dto.date).toDate() 
    } as AppointmentDto & { date: Date };
}
