import { Speciality } from "../enums/speciality.enum";

export interface Doctor {
    id?: number;
    name: string;
    surname: string;
    dni: string;
    phone: string;
    email: string;
    speciality: Speciality;
}