package Pet.Society.models.exceptions;

public class AppointmentWithoutPetException extends RuntimeException {
    public AppointmentWithoutPetException(String message) {
        super(message);
    }
}
