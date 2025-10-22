package Pet.Society.models.exceptions;

public class LoginErrorException extends RuntimeException {
    public LoginErrorException(String message) {
        super(message);
    }
}
