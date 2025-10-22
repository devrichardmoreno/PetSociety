package Pet.Society.models.exceptions;

public class NotInTimeException extends RuntimeException {
    public NotInTimeException(String message) {
        super(message);
    }
}
