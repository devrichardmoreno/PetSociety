package Pet.Society.config;

import Pet.Society.models.dto.client.ClientDTO;
import Pet.Society.models.dto.pet.PetDTO;
import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.services.AppointmentService;
import Pet.Society.services.ClientService;
import Pet.Society.services.CredentialService;
import Pet.Society.services.PetService;
import ch.qos.logback.core.net.server.Client;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OwnershipValidator {
    private final ClientService clientService;
    private final PetService petService;
    private final CredentialService credentialService;
    private final AppointmentService appointmentService;

    @Autowired
    public OwnershipValidator(ClientService clientService, PetService petService, CredentialService credentialService,AppointmentService appointmentService) {
        this.clientService = clientService;
        this.petService = petService;
        this.credentialService = credentialService;
        this.appointmentService = appointmentService;
    }


    public boolean canAccessClient(Long clientId){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) return true;

        CredentialEntity credential = credentialService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClientEntity client = (ClientEntity) credential.getUser();

        return client.getId()==(clientId);
    }

    public boolean canAccessClient(String dni){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) return true;

        CredentialEntity credential = credentialService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClientEntity client = (ClientEntity) credential.getUser();

        return client.getDni().equals(dni);
    }

    public boolean canAccessPet(Long petId){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) return true;

        PetEntity pet = petService.findById(petId); // lanza excepción si no existe
        Long ownerId = pet.getClient().getId();

        ClientEntity client = (ClientEntity) credentialService.findByUsername(username)
                .orElseThrow().getUser();

        return ownerId.equals(client.getId());
    }

    public boolean canAccessAppointment(Long appointmentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) return true;

        AppointmentEntity appointment = appointmentService.getEntity(appointmentId);
        Long ownerId = appointment.getPet().getClient().getId();

        CredentialEntity credential = credentialService.findByUsername(username).get();
        ClientEntity client = (ClientEntity) credential.getUser();

        return ownerId.equals(client.getId());
    }
}
