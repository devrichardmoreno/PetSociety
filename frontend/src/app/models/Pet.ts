export interface Pet {
  id: number;
  nombre: string;
  edad: number;
  citaProgramada?: {
    fecha: string;
    hora: string;
    doctor: string;
    motivo: string;
  };
}

