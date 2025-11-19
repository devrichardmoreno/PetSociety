import dayjs from "dayjs";
import { PetType } from '../../enums/pet-type.enum';
import { Reason } from '../../enums/reason.enum';

export interface DiagnoseDto {
    diagnose : string;
    treatment : string;
    doctorName : string;
    petName : string;
    petType?: PetType;
    otherType?: string;
    reason : string;
    appointmentReason?: Reason;
    date : string;
    clientName?: string;
    appointmentStartTime?: string;
    appointmentEndTime?: string;
}

export function mapDiagnoseDateToDate(dto: DiagnoseDto) {
    return {
        ...dto,
        date: dayjs(dto.date).toDate(),
        appointmentStartDate: dto.appointmentStartTime ? dayjs(dto.appointmentStartTime).toDate() : null,
        appointmentEndDate: dto.appointmentEndTime ? dayjs(dto.appointmentEndTime).toDate() : null
    } as DiagnoseDto & { 
        date: Date;
        appointmentStartDate?: Date | null;
        appointmentEndDate?: Date | null;
    };
}
