package Pet.Society.models.exceptions;

public class UnavailableAppointmentException extends RuntimeException {
    public UnavailableAppointmentException(String message) {
        super(message);
    }
}
