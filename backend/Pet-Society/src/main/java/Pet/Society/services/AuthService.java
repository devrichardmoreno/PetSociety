package Pet.Society.services;

import Pet.Society.models.dto.login.LoginDTO;
import Pet.Society.models.dto.login.LoginResponseDTO;
import Pet.Society.models.dto.register.RegisterDTO;
import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.entities.UserEntity;
import Pet.Society.models.enums.Role;
import Pet.Society.models.exceptions.UserNotFoundException;
import Pet.Society.repositories.CredentialRepository;
import Pet.Society.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final CredentialRepository credentialRepository;
    private final UserRepository userRepository; 

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CredentialService userDetailsService;


    @Autowired
    public AuthService(
        AuthenticationManager authenticationManager, 
        JwtService jwtService, 
        CredentialService userDetailsService,
        PasswordEncoder passwordEncoder, 
        CredentialRepository credentialRepository,
        UserRepository userRepository 
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder; 
        this.credentialRepository = credentialRepository;
        this.userRepository = userRepository; 
    }

    @Transactional
    public void registerNewUser(RegisterDTO request) {
        UserEntity newUser = UserEntity.builder()
            .name(request.getName())
            .surname(request.getSurname())
            .email(request.getEmail())
            .phone(request.getPhone())
            .dni(request.getDni())
            .subscribed(true)
            .build();
        
        newUser = userRepository.save(newUser); 
        

        CredentialEntity newCredential = CredentialEntity.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.CLIENT)
            .user(newUser) 
            .build();
        
        credentialRepository.save(newCredential);
    }

  
}