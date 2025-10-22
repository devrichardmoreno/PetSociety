package Pet.Society.models.exceptions;

public class PetHasAnAppointmentException extends RuntimeException {
    public PetHasAnAppointmentException(String message) {
        super(message);
    }
}
