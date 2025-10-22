package Pet.Society.models.exceptions;

public class NoPetsException extends RuntimeException {
    public NoPetsException(String message) {
        super(message);
    }
}
