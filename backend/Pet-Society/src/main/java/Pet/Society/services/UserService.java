package Pet.Society.services;

import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.entities.UserEntity;
import Pet.Society.models.enums.Role;
import Pet.Society.models.exceptions.UserExistsException;
import Pet.Society.models.exceptions.UserNotFoundException;
import Pet.Society.repositories.CredentialRepository;
import Pet.Society.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {


    private final UserRepository userRepository;

    private final CredentialRepository credentialRepository;

    public UserService(UserRepository userRepository, CredentialRepository credentialRepository) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
    }


    /**Create*/
    public UserEntity save(UserEntity admin) {
        Optional<UserEntity> existingAdmin = this.userRepository.findByDni(admin.getDni());
        if (existingAdmin.isPresent()) {
            throw new UserExistsException("User already exists");
        }
        this.userRepository.save(admin);
        return admin;
    }


    public void update(UserEntity userToUpdate, long id) {
        Optional<UserEntity> userOpt = this.userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new UserExistsException("User does not exist");
        }
        userToUpdate.setId(id);
        takeAttributes(userToUpdate, userOpt.get());
        this.userRepository.save(userToUpdate);
    }


    public UserEntity takeAttributes(UserEntity origin, UserEntity destination) {
        if(origin.getName() == null){origin.setName(destination.getName());}
        if(origin.getSurname() == null){origin.setSurname(destination.getSurname());}
        origin.setEmail(destination.getEmail());   // DNI y email inmodificables: siempre se mantienen
        origin.setDni(destination.getDni());
        if(origin.getPhone() == null){origin.setPhone(destination.getPhone());}
        if(origin.getSubscribed() == null){origin.setSubscribed(destination.getSubscribed());}
        if(origin.getEmailVerified() == null){origin.setEmailVerified(destination.getEmailVerified());}

        return origin;
    }


    /**unSuscribe*/
    public void unSubscribe(Long id){
        Optional<UserEntity> existingUser = this.userRepository.findById(id);
        if (existingUser.isEmpty()){
            throw new UserNotFoundException("User does not exist");
        }
        UserEntity userToUnsubscribe = existingUser.get();
        
        // Verificar si el usuario es admin buscando en las credenciales con rol ADMIN
        List<CredentialEntity> adminCredentials = credentialRepository.findByRole(Role.ADMIN);
        boolean isAdmin = adminCredentials.stream()
                .anyMatch(cred -> cred.getUser() != null && cred.getUser().getId() == id);
        
        if (isAdmin) {
            // Si es admin, verificar que quede al menos uno activo
            List<UserEntity> activeAdmins = findActiveAdmins();
            // Verificar que el usuario que se está dando de baja esté en la lista de activos
            boolean isCurrentlyActive = activeAdmins.stream()
                    .anyMatch(admin -> admin.getId() == id);
            
            if (isCurrentlyActive && activeAdmins.size() <= 1) {
                // Si solo hay 1 admin activo (el que se está intentando dar de baja), lanzar excepción
                throw new Pet.Society.models.exceptions.LastAdminException(
                    "No se puede dar de baja al último administrador activo. Debe quedar al menos un administrador en el sistema."
                );
            }
        }
        
        userToUnsubscribe.setSubscribed(false);
        this.userRepository.save(userToUnsubscribe);
    }

    /**Suscribe uno ya dado de baja por la funcion de arriba
     * en caso de que un user se vaya y quiera volver*/
    public void reSubscribe(Long id) {
        Optional<UserEntity> existingUser = this.userRepository.findById(id);
        if (existingUser.isEmpty()) {
            throw new UserNotFoundException("User does not exist");
        }
        UserEntity userToResubscribe = existingUser.get();
        userToResubscribe.setSubscribed(true);
        this.userRepository.save(userToResubscribe);
    }


    /**Find by ROLE ADMIN*/
    public List<UserEntity> findByRole() {
        return credentialRepository.findByRole(Role.ADMIN)
                .stream()
                .map(CredentialEntity::getUser)
                .collect(Collectors.toList());
    }

    /**Find by ROLE ADMIN - Active only*/
    public List<UserEntity> findActiveAdmins() {
        return credentialRepository.findByRole(Role.ADMIN)
                .stream()
                .map(CredentialEntity::getUser)
                .filter(user -> user.getSubscribed() != null && user.getSubscribed())
                .collect(Collectors.toList());
    }

    /**Find by ROLE ADMIN - Inactive only*/
    public List<UserEntity> findInactiveAdmins() {
        return credentialRepository.findByRole(Role.ADMIN)
                .stream()
                .map(CredentialEntity::getUser)
                .filter(user -> user.getSubscribed() == null || !user.getSubscribed())
                .collect(Collectors.toList());
    }

    /**Find user by ID*/
    public UserEntity findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " was not found."));
    }

    /**Check if DNI exists*/
    public boolean existsByDni(String dni) {
        return userRepository.findByDni(dni).isPresent();
    }

    /**Check if email exists*/
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /**Check if phone exists*/
    public boolean existsByPhone(String phone) {
        return userRepository.findByPhone(phone).isPresent();
    }

}

