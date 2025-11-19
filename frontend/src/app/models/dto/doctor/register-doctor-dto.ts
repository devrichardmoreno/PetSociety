import { Speciality } from "../../enums/speciality.enum";

export interface RegisterDoctorDTO {
        username: string;
        password: string;
        name: string;
        surname: string;
        dni: string;
        phone: string;
        email: string;
        speciality: Speciality;
}
