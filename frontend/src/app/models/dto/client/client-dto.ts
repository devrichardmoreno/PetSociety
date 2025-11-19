export interface ClientDTO {
  id?: number;
  name: string;
  surname: string;
  dni: string;
  phone: string;
  email: string;
  pets?: any[];
  petsCount?: number;
}

