package Pet.Society.services;

import Pet.Society.models.dto.login.LoginDTO;
import Pet.Society.models.dto.login.LoginResponseDTO;
import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.exceptions.UserNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private AuthenticationManager authenticationManager;

    private JwtService jwtService;

    private CredentialService userDetailsService;


    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService, CredentialService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
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


        return new LoginResponseDTO(token, credential.getId());
    }
}
