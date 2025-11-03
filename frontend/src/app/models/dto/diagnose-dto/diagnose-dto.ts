import dayjs from "dayjs";

export interface DiagnoseDto {
    diagnose : string;
    treatment : string;
    doctorName : string;
    petName : string;
    reason : string;
    date : string;
}



export function mapDiagnoseDateToDate(dto: DiagnoseDto) {
    return {
        ...dto,
        date: dayjs(dto.date).toDate() 
    } as DiagnoseDto & { date: Date };
}

