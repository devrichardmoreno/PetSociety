package Pet.Society.services;

import Pet.Society.models.dto.auth.ForgotPasswordDTO;
import Pet.Society.models.dto.auth.ForgotPasswordResponseDTO;
import Pet.Society.models.dto.auth.ResetPasswordDTO;
import Pet.Society.models.dto.login.LoginDTO;
import Pet.Society.models.dto.login.LoginResponseDTO;
import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.entities.UserEntity;
import Pet.Society.models.exceptions.UserNotFoundException;
import Pet.Society.repositories.CredentialRepository;
import Pet.Society.repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private CredentialService userDetailsService;
    private UserRepository userRepository;
    private CredentialRepository credentialRepository;
    private PasswordEncoder passwordEncoder;
    private EmailService emailService;

    public AuthService(AuthenticationManager authenticationManager, 
                      JwtService jwtService, 
                      CredentialService userDetailsService,
                      UserRepository userRepository,
                      CredentialRepository credentialRepository,
                      PasswordEncoder passwordEncoder,
                      EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public LoginResponseDTO login(LoginDTO request){
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password", e);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        CredentialEntity credential = userDetailsService.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + request.getUsername()));

        String token = jwtService.generateToken(userDetails);

        // Retornar el ID del usuario (ClientEntity, DoctorEntity, etc.), no el de la credencial
        return new LoginResponseDTO(token, credential.getUser().getId());
    }

    /**
     * Genera un token de reset de contraseña para el email proporcionado
     * Si el email existe en el sistema, genera un token y lo devuelve
     * El token se muestra en pantalla (no se envía por email)
     */
    public ForgotPasswordResponseDTO forgotPassword(ForgotPasswordDTO request) {
        // Buscar usuario por email (solo validamos formato, no existencia real del email)
        Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty()) {
            // Por seguridad, no revelamos si el email existe o no
            throw new UserNotFoundException("Si el email existe en nuestro sistema, recibirás un token de recuperación.");
        }
        
        UserEntity user = userOpt.get();
        
        // Buscar las credenciales del usuario directamente por su ID usando el repositorio
        Optional<CredentialEntity> credentialOpt = credentialRepository.findByUser_Id(user.getId());
        
        if (credentialOpt.isEmpty()) {
            throw new UserNotFoundException("No se encontraron credenciales para este usuario.");
        }
        
        CredentialEntity credential = credentialOpt.get();
        
        // Generar token de reset (expira en 30 minutos)
        String resetToken = jwtService.generatePasswordResetToken(credential.getUsername());
        
        // Enviar email con el token
        try {
            String userName = user.getName() + " " + user.getSurname();
            emailService.sendPasswordResetToken(user.getEmail(), resetToken, userName);
            
            return new ForgotPasswordResponseDTO(
                null, // Ya no devolvemos el token en la respuesta
                "Se envió un email a " + request.getEmail() + " con las instrucciones para restablecer tu contraseña. Revisá tu bandeja de entrada (y la carpeta de spam si no lo ves)."
            );
        } catch (Exception e) {
            // Si falla el envío de email, devolver el token en la respuesta como fallback
            return new ForgotPasswordResponseDTO(
                resetToken,
                "Hubo un problema al enviar el email. Usá este token para restablecer tu contraseña: " + resetToken
            );
        }
    }

    /**
     * Restablece la contraseña usando el token de reset
     */
    @Transactional
    public void resetPassword(ResetPasswordDTO request) {
        // Validar que el token sea válido para reset de contraseña
        if (!jwtService.isPasswordResetTokenValid(request.getToken())) {
            throw new BadCredentialsException("Token inválido o expirado. Por favor, solicitá un nuevo token.");
        }
        
        // Extraer el username del token
        String username = jwtService.extractUsername(request.getToken());
        
        // Buscar las credenciales
        CredentialEntity credential = userDetailsService.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado."));
        
        // Actualizar la contraseña
        credential.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userDetailsService.save(credential);
    }
}
