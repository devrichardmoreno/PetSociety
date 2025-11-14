package Pet.Society.controllers;

import Pet.Society.models.dto.login.LoginDTO;
import Pet.Society.models.dto.login.LoginResponseDTO;
import Pet.Society.services.AuthService;
import Pet.Society.services.CredentialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    public AuthController(AuthService authService, CredentialService credentialService) {
        this.authService = authService;
        this.credentialService = credentialService;
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


}
