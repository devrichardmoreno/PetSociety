package Pet.Society.models.exceptions;

public class TooManyPetsException extends RuntimeException {
    public TooManyPetsException(String message) {
        super(message);
    }
}

