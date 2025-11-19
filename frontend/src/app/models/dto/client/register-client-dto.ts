import { RegisterDTO } from '../auth/register-dto';

export interface RegisterClientDTO extends RegisterDTO {
  foundation: boolean;
}

