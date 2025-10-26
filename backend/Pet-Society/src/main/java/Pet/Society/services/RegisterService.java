package Pet.Society.services;

import Pet.Society.models.dto.client.ClientDTO;
import Pet.Society.models.dto.register.RegisterDTO;
import Pet.Society.models.dto.register.RegisterDoctorDTO;
import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.UserEntity;
import Pet.Society.models.enums.Role;
import Pet.Society.models.exceptions.UserAttributeException;
import Pet.Society.models.interfaces.Mapper;
import com.mysql.cj.xdevapi.Client;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService  {

    private final ClientService clientService;

    private final CredentialService credentialService;

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    private final DoctorService doctorService;

    @Autowired
    public RegisterService(ClientService clientService, CredentialService credentialService, UserService userService, PasswordEncoder passwordEncoder, DoctorService doctorService) {
        this.clientService = clientService;
        this.credentialService = credentialService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.doctorService = doctorService;
    }

    @Transactional
    public ClientDTO registerNewClient(RegisterDTO registerDTO) {
        ClientDTO clientDTO = ClientDTO.builder()
                .name(registerDTO.getName())
                .surname(registerDTO.getSurname())
                .email(registerDTO.getEmail())
                .phone(registerDTO.getPhone())
                .dni(registerDTO.getDni())
                .phone(registerDTO.getPhone())
                .build();

        CredentialEntity credentialEntity = new CredentialEntity();
        credentialEntity.setUsername(registerDTO.getUsername());
        credentialEntity.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        credentialEntity.setRole(Role.CLIENT);
        credentialEntity.setUser(clientService.save(clientDTO));


        credentialService.save(credentialEntity);
        return clientDTO;
    }

    @Transactional
    public void registerNewAdmin(RegisterDTO registerDTO) {

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
    }

    @Transactional(rollbackOn = UserAttributeException.class)
    public void registerNewDoctor(RegisterDoctorDTO registerDTO) {
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
    }



}
