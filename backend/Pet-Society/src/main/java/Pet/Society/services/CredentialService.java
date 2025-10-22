package Pet.Society.services;

import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.repositories.CredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CredentialService implements UserDetailsService {

    private final CredentialRepository credentialRepository;

    //ALL OF THIS METHOD MUST BE NEED FOR OPERATIONAL FUNCTIONS. NOT FOR CONTROLLER!!

    @Autowired
    public CredentialService(CredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
    }

    public List<CredentialEntity> listAll (){
        return credentialRepository.findAll();
    }

    public void delete(Long id){
       credentialRepository.deleteById(id);
    }

    @Transactional
    public CredentialEntity save(CredentialEntity c){
        return credentialRepository.save(c);
    }

    public Optional<CredentialEntity> findById(Long id){
        return credentialRepository.findById(id);
    }


    public Optional<CredentialEntity> findByUsername(String username) {
        return credentialRepository.findByUsername(username);
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return credentialRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}
