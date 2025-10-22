package Pet.Society.models.exceptions;

public class DuplicatedAppointmentException extends RuntimeException {
    public DuplicatedAppointmentException(String message) {
        super(message);
    }
}
