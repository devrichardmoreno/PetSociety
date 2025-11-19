import { PetType } from '../enums/pet-type.enum';

export interface Pet {
  id: number;
  nombre: string;
  edad: number;
  tipoAnimal: PetType;
  tipoAnimalOtro?: string;
  citaProgramada?: {
    fecha: string;
    hora: string;
    doctor: string;
    motivo: string;
  };
}

