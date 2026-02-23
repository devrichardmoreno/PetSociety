package Pet.Society.services;

import Pet.Society.models.dto.client.ClientDTO;
import Pet.Society.models.dto.register.RegisterDTO;
import Pet.Society.models.dto.register.RegisterClientDTO;
import Pet.Society.models.dto.register.RegisterDoctorDTO;
import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.UserEntity;
import Pet.Society.models.enums.Role;
import Pet.Society.models.exceptions.UserAttributeException;
import Pet.Society.models.exceptions.UserExistsException;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService  {

    private final ClientService clientService;

    private final CredentialService credentialService;

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    private final DoctorService doctorService;

    private final EmailService emailService;

    private final JwtService jwtService;

    public RegisterService(ClientService clientService, CredentialService credentialService, UserService userService, PasswordEncoder passwordEncoder, DoctorService doctorService, EmailService emailService, JwtService jwtService) {
        this.clientService = clientService;
        this.credentialService = credentialService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.doctorService = doctorService;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    @Transactional
    public ClientDTO registerNewClient(RegisterDTO registerDTO) {
        // Validar si el username ya existe
        if (credentialService.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new UserExistsException("Username already exists");
        }

        ClientDTO clientDTO = ClientDTO.builder()
                .name(registerDTO.getName())
                .surname(registerDTO.getSurname())
                .email(registerDTO.getEmail())
                .phone(registerDTO.getPhone())
                .dni(registerDTO.getDni())
                .build();

        CredentialEntity credentialEntity = new CredentialEntity();
        credentialEntity.setUsername(registerDTO.getUsername());
        credentialEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        credentialEntity.setRole(Role.CLIENT);
        
        // Si foundation viene en el DTO, usar saveWithFoundation, sino usar save normal
        if (registerDTO.getFoundation() != null) {
            credentialEntity.setUser(clientService.saveWithFoundation(clientDTO, registerDTO.getFoundation()));
        } else {
            credentialEntity.setUser(clientService.save(clientDTO));
        }

        credentialService.save(credentialEntity);
        
        // Enviar email de verificación
        try {
            String verificationToken = jwtService.generateEmailVerificationToken(registerDTO.getUsername());
            String userName = registerDTO.getName() + " " + registerDTO.getSurname();
            emailService.sendEmailVerification(registerDTO.getEmail(), verificationToken, userName);
        } catch (Exception e) {
            // Si falla el envío del email, hacer rollback de la transacción
            throw new RuntimeException("No se pudo enviar el email de verificación. Por favor, verifica que el email sea válido: " + e.getMessage(), e);
        }
        
        return clientDTO;
    }

    @Transactional
    public ClientDTO registerNewClientFromAdmin(RegisterClientDTO registerDTO) {
        // Validar si el username ya existe
        if (credentialService.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new UserExistsException("Username already exists");
        }

        ClientDTO clientDTO = ClientDTO.builder()
                .name(registerDTO.getName())
                .surname(registerDTO.getSurname())
                .email(registerDTO.getEmail())
                .phone(registerDTO.getPhone())
                .dni(registerDTO.getDni())
                .build();

        CredentialEntity credentialEntity = new CredentialEntity();
        credentialEntity.setUsername(registerDTO.getUsername());
        credentialEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        credentialEntity.setRole(Role.CLIENT);
        credentialEntity.setUser(clientService.saveWithFoundation(clientDTO, registerDTO.getFoundation()));

        credentialService.save(credentialEntity);
        
        // Enviar email de verificación
        try {
            String verificationToken = jwtService.generateEmailVerificationToken(registerDTO.getUsername());
            String userName = registerDTO.getName() + " " + registerDTO.getSurname();
            emailService.sendEmailVerification(registerDTO.getEmail(), verificationToken, userName);
        } catch (Exception e) {
            // Si falla el envío del email, hacer rollback de la transacción
            throw new RuntimeException("No se pudo enviar el email de verificación. Por favor, verifica que el email sea válido: " + e.getMessage(), e);
        }
        
        return clientDTO;
    }

    @Transactional
    public void registerNewAdmin(RegisterDTO registerDTO) {
        // Validar si el username ya existe
        if (credentialService.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new UserExistsException("Username already exists");
        }

        UserEntity userEntity = new UserEntity();
        userEntity.setName(registerDTO.getName());
        userEntity.setSurname(registerDTO.getSurname());
        userEntity.setDni(registerDTO.getDni());
        userEntity.setEmail(registerDTO.getEmail());
        userEntity.setPhone(registerDTO.getPhone());

        CredentialEntity credentialEntity = new CredentialEntity();
        credentialEntity.setUsername(registerDTO.getUsername());
        credentialEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        credentialEntity.setRole(Role.ADMIN);
        credentialEntity.setUser(userService.save(userEntity));

        credentialService.save(credentialEntity);
        
        // Enviar email de verificación
        try {
            String verificationToken = jwtService.generateEmailVerificationToken(registerDTO.getUsername());
            String userName = registerDTO.getName() + " " + registerDTO.getSurname();
            emailService.sendEmailVerification(registerDTO.getEmail(), verificationToken, userName);
        } catch (Exception e) {
            // Si falla el envío del email, hacer rollback de la transacción
            throw new RuntimeException("No se pudo enviar el email de verificación. Por favor, verifica que el email sea válido: " + e.getMessage(), e);
        }
    }

    @Transactional(rollbackOn = UserAttributeException.class)
    public void registerNewDoctor(RegisterDoctorDTO registerDTO) {
        // Validar si el username ya existe
        if (credentialService.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new UserExistsException("Username already exists");
        }
        
        if (doctorService.doctorExistByDni(registerDTO.getDni())) {
            throw new UserAttributeException("Doctor with this DNI already exists");
        }

        DoctorEntity doctorEntity = new DoctorEntity();
        doctorEntity.setName(registerDTO.getName());
        doctorEntity.setSurname(registerDTO.getSurname());
        doctorEntity.setDni(registerDTO.getDni());
        doctorEntity.setEmail(registerDTO.getEmail());
        doctorEntity.setPhone(registerDTO.getPhone());
        doctorEntity.setSpeciality(registerDTO.getSpeciality());

        CredentialEntity credentialEntity = new CredentialEntity();
        credentialEntity.setUsername(registerDTO.getUsername());
        credentialEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        credentialEntity.setRole(Role.DOCTOR);

        doctorService.saveEntity(doctorEntity);

        credentialEntity.setUser(doctorEntity);

        credentialService.save(credentialEntity);
        
        // Enviar email de verificación
        try {
            String verificationToken = jwtService.generateEmailVerificationToken(registerDTO.getUsername());
            String userName = registerDTO.getName() + " " + registerDTO.getSurname();
            emailService.sendEmailVerification(registerDTO.getEmail(), verificationToken, userName);
        } catch (Exception e) {
            // Si falla el envío del email, hacer rollback de la transacción
            throw new RuntimeException("No se pudo enviar el email de verificación. Por favor, verifica que el email sea válido: " + e.getMessage(), e);
        }
    }



}
