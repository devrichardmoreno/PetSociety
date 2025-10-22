package Pet.Society.models.exceptions;

public class AppointmentDoesntExistException extends RuntimeException {
    public AppointmentDoesntExistException(String message) {
        super(message);
    }
}
