package Pet.Society.services;

import Pet.Society.models.dto.auth.ChangeEmailUnverifiedDTO;
import Pet.Society.models.dto.auth.ForgotPasswordDTO;
import Pet.Society.models.dto.auth.ForgotPasswordResponseDTO;
import Pet.Society.models.dto.auth.ResetPasswordDTO;
import Pet.Society.models.dto.login.LoginDTO;
import Pet.Society.models.dto.login.LoginResponseDTO;
import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.entities.UserEntity;
import Pet.Society.models.exceptions.EmailNotVerifiedException;
import Pet.Society.models.exceptions.UserAttributeException;
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

        // Verificar que el email esté verificado
        UserEntity user = credential.getUser();
        if (user != null && (user.getEmailVerified() == null || !user.getEmailVerified())) {
            throw new EmailNotVerifiedException("Tu email no ha sido verificado. Por favor, verificá tu email antes de iniciar sesión. Revisá tu bandeja de entrada (y la carpeta de spam si no lo ves).");
        }

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

    /**
     * Verifica el email del usuario usando el token de verificación
     */
    @Transactional
    public void verifyEmail(String token) {
        // Validar que el token sea válido para verificación de email
        if (!jwtService.isEmailVerificationTokenValid(token)) {
            throw new BadCredentialsException("Token inválido o expirado. Por favor, solicitá un nuevo email de verificación.");
        }
        
        // Extraer el username del token
        String username = jwtService.extractUsername(token);
        
        // Buscar las credenciales
        CredentialEntity credential = userDetailsService.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado."));
        
        // Marcar el email como verificado (actualización directa para evitar problemas con herencia JPA)
        UserEntity user = credential.getUser();
        if (user == null) {
            throw new UserNotFoundException("No se encontró el usuario asociado a estas credenciales.");
        }
        int updated = userRepository.setEmailVerifiedTrue(user.getId());
        if (updated == 0) {
            throw new UserNotFoundException("No se pudo actualizar la verificación del usuario.");
        }
    }

    /**
     * Reenvía el email de verificación para un usuario
     */
    public void resendVerificationEmail(String username) {
        // Buscar las credenciales
        CredentialEntity credential = userDetailsService.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado."));
        
        UserEntity user = credential.getUser();
        if (user == null) {
            throw new UserNotFoundException("No se encontró el usuario asociado a estas credenciales.");
        }
        
        // Si ya está verificado, no hacer nada
        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            throw new RuntimeException("El email ya está verificado.");
        }
        
        // Generar nuevo token y enviar email
        String verificationToken = jwtService.generateEmailVerificationToken(username);
        String userName = user.getName() + " " + user.getSurname();
        emailService.sendEmailVerification(user.getEmail(), verificationToken, userName);
    }

    /**
     * Permite cambiar el email a un usuario que aún no verificó su cuenta (ej. se equivocó al registrarse).
     * Debe indicar username, contraseña y el nuevo email.
     */
    @Transactional
    public void changeEmailForUnverifiedUser(ChangeEmailUnverifiedDTO request) {
        CredentialEntity credential = userDetailsService.findByUsername(request.getUsername())
            .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos."));

        if (!passwordEncoder.matches(request.getPassword(), credential.getPassword())) {
            throw new BadCredentialsException("Usuario o contraseña incorrectos.");
        }

        UserEntity user = credential.getUser();
        if (user == null) {
            throw new UserNotFoundException("No se encontró el usuario asociado a estas credenciales.");
        }

        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            throw new UserAttributeException("Tu email ya está verificado. Si necesitás cambiar tu email, contactá a soporte.");
        }

        // Que el nuevo email no esté en uso por otra cuenta (otro usuario con distinto id)
        Optional<UserEntity> existingWithEmail = userRepository.findByEmail(request.getNewEmail());
        if (existingWithEmail.isPresent() && existingWithEmail.get().getId() != user.getId()) {
            throw new UserAttributeException("Ese email ya está en uso por otra cuenta.");
        }

        user.setEmail(request.getNewEmail());
        userRepository.save(user);

        String verificationToken = jwtService.generateEmailVerificationToken(request.getUsername());
        String userName = user.getName() + " " + user.getSurname();
        emailService.sendEmailVerification(request.getNewEmail(), verificationToken, userName);
    }
}
