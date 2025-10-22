package Pet.Society.models.exceptions;

public class PetAlreadyExistsException extends RuntimeException {
    public PetAlreadyExistsException(String message) {
        super(message);
    }
}
