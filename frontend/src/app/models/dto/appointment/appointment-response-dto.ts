import { Reason } from '../../enums/reason.enum';
import { Status} from '../../enums/status.enum'; 

export interface AppointmentResponseDTO {
  id : number;
  startTime: string;
  endTime: string;    
  doctorName: string;
  clientName?: string;
  petName: string;
  reason: Reason;
  aproved: boolean;
  status: Status;
  diagnose?: string;
  treatment?: string;
}