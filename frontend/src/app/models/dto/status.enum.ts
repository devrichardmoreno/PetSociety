export enum Status {
  CANCELED = 'CANCELED',        // La cita fue cancelada
  RESCHEDULED = 'RESCHEDULED',  // La cita fue reprogramada
  SUCCESSFULLY = 'SUCCESSFULLY',// La cita fue completada satisfactoriamente
  TO_BEGIN = 'TO_BEGIN',        // La cita está programada y lista para ser realizada
  AVAILABLE = 'AVAILABLE'       // La cita está disponible para reservar
}