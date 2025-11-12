import { Speciality } from "./dto/speciality.enum";

export interface Doctor {
    name: string;
    surname: string;
    dni: string;
    phone: string;
    email: string;
    speciality: Speciality;
}