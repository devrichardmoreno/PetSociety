package Pet.Society.controllers;

import Pet.Society.models.dto.auth.ForgotPasswordDTO;
import Pet.Society.models.dto.auth.ForgotPasswordResponseDTO;
import Pet.Society.models.dto.auth.ResetPasswordDTO;
import Pet.Society.models.dto.login.LoginDTO;
import Pet.Society.models.dto.login.LoginResponseDTO;
import Pet.Society.services.AuthService;
import Pet.Society.services.CredentialService;
import Pet.Society.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(
        name = "Login",
        description = "Controller for user login"
)
@RestController
@RequestMapping("/auth")
public class AuthController {
    // This controller can be used to handle authentication-related endpoints
    // For example, you can add methods for registration, password reset, etc.
    // Currently, it serves as a placeholder for future authentication-related functionality.

    private final AuthService authService;
    private final CredentialService credentialService;
    private final UserService userService;

    public AuthController(AuthService authService, CredentialService credentialService, UserService userService) {
        this.authService = authService;
        this.credentialService = credentialService;
        this.userService = userService;
    }


    @Operation(
            summary = "Authenticate user",
            description = "Verifies credentials and returns a token or session information if successful.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Login successful",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponseDTO.class))
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Invalid credentials",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginDTO request){
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Check if username exists",
            description = "Verifies if a username is already taken.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Username availability checked",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = credentialService.findByUsername(username).isPresent();
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Check if DNI exists",
            description = "Verifies if a DNI is already registered.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "DNI availability checked",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/check-dni")
    public ResponseEntity<Map<String, Boolean>> checkDni(@RequestParam String dni) {
        boolean exists = userService.existsByDni(dni);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Check if email exists",
            description = "Verifies if an email is already registered.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Email availability checked",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Check if phone exists",
            description = "Verifies if a phone number is already registered.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Phone availability checked",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Solicitar reset de contraseña",
            description = "Genera un token de recuperación para el email proporcionado. El token se muestra en pantalla.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Token generado exitosamente",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ForgotPasswordResponseDTO.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Email no encontrado en el sistema",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponseDTO> forgotPassword(@Valid @RequestBody ForgotPasswordDTO request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @Operation(
            summary = "Restablecer contraseña",
            description = "Restablece la contraseña usando el token de recuperación.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Contraseña restablecida exitosamente",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Token inválido o expirado",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordDTO request) {
        authService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contraseña restablecida exitosamente. Ya podés iniciar sesión con tu nueva contraseña.");
        return ResponseEntity.ok(response);
    }

}
