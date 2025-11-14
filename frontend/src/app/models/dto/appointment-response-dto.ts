import { Reason } from './reason.enum';
import { Status} from './status.enum'; 

export interface AppointmentResponseDTO {
  id : number;
  startTime: string;
  endTime: string;    
  doctorName: string;
  petName: string;
  reason: Reason;
  aproved: boolean;
  status: Status;
}