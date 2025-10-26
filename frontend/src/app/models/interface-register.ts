export interface InterfaceRegister {
    username : string,
    password: string,
    name: string,
    surname: string,
    email: string,
    phone: string,
    dni: string
}

 export interface InterfaceRegisterDoctor extends InterfaceRegister{
     speciality : Speciality;
}

export enum Speciality {
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  GENERAL = 'GENERAL'
}

export interface ClientDTO {
  name: string;
  surname: string;
  phone: string;
  dni: string;
  email: string;
}

