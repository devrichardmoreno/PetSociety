package Pet.Society.models.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.OffsetDateTime;

@RestControllerAdvice
public class GlobalControllerException {

    private ProblemDetail createProblemDetail(HttpStatus status, String title, String detail, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setInstance(URI.create(request.getRequestURL().toString()));
        problem.setProperty("timestamp", OffsetDateTime.now());
        return problem;
    }

    @ExceptionHandler(UserExistsException.class)
    public ProblemDetail HandlerUserExistsException(UserExistsException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "User Exists", "The user already exists", request);
    }

    @ExceptionHandler(NoPetsException.class)
    public ProblemDetail HandlerNoPetsException(NoPetsException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "No Pets Exception", "The client doesn't have pets", request);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail HandlerUserNotFoundException(UserNotFoundException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.NOT_FOUND, "User Not Found", "The user does not exist", request);
    }

    @ExceptionHandler(UnsubscribedUserException.class)
    public ProblemDetail HandlerUnsubscribedUserException(UnsubscribedUserException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "User Unsubscribed", "The user is unsubscribed", request);
    }

    @ExceptionHandler(PetNotFoundException.class)
    public ProblemDetail HandlerPetNotFoundException(PetNotFoundException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.NOT_FOUND, "Pet Not Found", "The pet does not exist", request);
    }

    @ExceptionHandler(TooManyPetsException.class)
    public ProblemDetail HandlerTooManyPetsException(TooManyPetsException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "Too Many Pets", "Un cliente puede tener un máximo de 5 mascotas registradas", request);
    }

    @ExceptionHandler(UserAttributeException.class)
    public ProblemDetail handlerUserAttributeException(UserAttributeException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.BAD_REQUEST, "Invalid User Attributes", "The data entered is not correct: " + ex.getMessage(), request);
    }

    @ExceptionHandler(LoginErrorException.class)
    public ProblemDetail handlerLoginError(LoginErrorException ex, HttpServletRequest request) {
        ProblemDetail problem = createProblemDetail(HttpStatus.UNAUTHORIZED, "Login Error", ex.getMessage(), request);
        problem.setProperty("error", "An error occurred during login");
        return problem;
    }

    @ExceptionHandler(DiagnosesNotFoundException.class)
    public ProblemDetail handlerDiagnosesNotFoundException(DiagnosesNotFoundException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.NOT_FOUND, "Diagnoses Not Found", "The diagnoses does not exist: " + ex.getMessage(), request);
    }

    @ExceptionHandler(DuplicatedAppointmentException.class)
    public ProblemDetail handlerDuplicatedAppointmentException(DuplicatedAppointmentException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "Duplicated Appointment", ex.getMessage(), request);
    }

    @ExceptionHandler(UnavailableAppointmentException.class)
    public ProblemDetail handlerUnavailableAppointmentException(UnavailableAppointmentException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "Unavailable Appointment", ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidAppointmentTimeException.class)
    public ProblemDetail handlerInvalidAppointmentTimeException(InvalidAppointmentTimeException ex, HttpServletRequest request){
        return createProblemDetail(HttpStatus.CONFLICT, "" ,ex.getMessage(), request);
    }


    @ExceptionHandler(Exception.class)
    public ProblemDetail HandlerException(Exception ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "There was an error processing the request. " + ex.getMessage(), request);
    }

    @ExceptionHandler(BeforeAppointmentException.class)
    public ProblemDetail handlerBeforeAppointmentException(BeforeAppointmentException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "Before Appointment Exception", "You can't make a diagnoses before appointment starts" + ex.getMessage(), request);
    }


    @ExceptionHandler(AppointmentWithoutPetException.class)
    public ProblemDetail HandlerAppointmentWithoutPetException(AppointmentWithoutPetException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.CONFLICT, "Appointment Without Pet", "You can't make a diagnoses without a pet in the appointment", request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handlerDataIntegrityViolationException(DataIntegrityViolationException ex, HttpServletRequest request) {
        String message = ex.getMessage();
        String detail = "Duplicate entry detected. ";
        
        // Verificar si es por username, email o DNI duplicado
        if (message != null) {
            if (message.contains("username") || message.contains("UK_")) {
                detail += "The username already exists.";
            } else if (message.contains("email")) {
                detail += "The email already exists.";
            } else if (message.contains("dni")) {
                detail += "The DNI already exists.";
            } else {
                detail += "This information is already registered in the system.";
            }
        }
        
        return createProblemDetail(HttpStatus.CONFLICT, "Data Integrity Violation", detail, request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handlerBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.UNAUTHORIZED, "Authentication Failed", "Invalid username or password", request);
    }

    @ExceptionHandler(DisabledException.class)
    public ProblemDetail handlerDisabledException(DisabledException ex, HttpServletRequest request) {
        return createProblemDetail(HttpStatus.UNAUTHORIZED, "Authentication Failed", "Invalid username or password", request);
    }


}
