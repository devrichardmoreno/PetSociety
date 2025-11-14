import { PetType } from './pet-type.enum';

export interface PetDTO {
  id?: number;
  name: string;
  age: number;
  active?: boolean;
  petType: PetType;
  otherType?: string;
  clientId: number;
}

