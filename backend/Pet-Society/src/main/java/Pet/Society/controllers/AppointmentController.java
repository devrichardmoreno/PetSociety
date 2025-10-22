package Pet.Society.controllers;

import Pet.Society.config.OwnershipValidator;
import Pet.Society.models.dto.appointment.AppointmentDTO;
import Pet.Society.models.dto.appointment.AppointmentResponseDTO;
import Pet.Society.models.dto.appointment.AppointmentUpdateDTO;
import Pet.Society.models.dto.doctor.DoctorAvailabilityDTO;
import Pet.Society.models.dto.pet.AssingmentPetDTO;
import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.services.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import Pet.Society.config.OwnershipValidator;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Appointment",
        description = "Controller for managing appointments"
)
@RestController
@RequestMapping("/appointment")
public class AppointmentController {


    private final AppointmentService appointmentService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;

    }


    @Operation(
            summary = "Create a new appointment",
            description = "Endpoint to create a new appointment with the necessary details",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointment created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid input data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )

    @PostMapping("/create")

    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointment) {
        return ResponseEntity.ok(this.appointmentService.save(appointment));
    }

    @Operation(
            summary = "Get all appointments",
            description = "Endpoint to retrieve all appointments",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of appointments retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentEntity.class)
                            )
                    )
            }
    )
    @PatchMapping("/assign/{id}")
    @PreAuthorize("@ownershipValidator.canAccessPet(#pet.petId)")
    public ResponseEntity<AppointmentResponseDTO> assignAppointment(@PathVariable("id") Long appointmentId, @RequestBody AssingmentPetDTO pet) {
        return ResponseEntity.ok(this.appointmentService.bookAppointment(appointmentId,pet));
    }


    @Operation(
            summary = "Update an appointment",
            description = "Endpoint to update an existing appointment by ID",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointment updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Appointment not found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )
    @PatchMapping("/update/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id, @RequestBody AppointmentDTO appointmentUpdateDTO) {

        return ResponseEntity.ok(this.appointmentService.updateAppointment(appointmentUpdateDTO, id));
    }

    @DeleteMapping("/cancel/{id}")
    @PreAuthorize("@ownershipValidator.canAccessAppointment(#id)")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long id) {
        this.appointmentService.cancelAppointment(id);
        return ResponseEntity.ok("Appointment cancelled successfully");
    }

    @PreAuthorize("@ownershipValidator.canAccessAppointment(#id)")
    @GetMapping("/findAppointment/{id}")
    public ResponseEntity<AppointmentResponseDTO> getAllAppointments(@PathVariable Long id) {
        return ResponseEntity.ok(this.appointmentService.getAppointment(id));
    }

    @Operation(
            summary = "Get appointments from a specific client",
            description = "Endpoint to retrieve an all appointments from a specific client by their ID",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointments for the specified client retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Appointments for the specified client not found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )
    @PreAuthorize("@ownershipValidator.canAccessClient(#id)")
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByClientId(@PathVariable Long clientId) {
            return ResponseEntity.ok(this.appointmentService.getLastAppointmentsByClientId(clientId));
    }

    @PostMapping("uploadAvailability/{doctorId}")
    public ResponseEntity<String> uploadAvailabilityDoctor(@PathVariable long doctorId, @RequestBody DoctorAvailabilityDTO availabilityDTO){
            this.appointmentService.uploadAvailibility(doctorId,availabilityDTO);
            return ResponseEntity.ok("The hours was uploaded successfully");
    }

    @Operation(
            summary = "Get appointments from a specific pet",
            description = "Endpoint to retrieve an appointments from a specific pet by its ID",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointments for the specified pet retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Appointments for the specified pet not found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )
    @GetMapping("/pet/{petId}")
    @PreAuthorize("@ownershipValidator.canAccessPet(#id)")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPetId(@PathVariable Long petId) {
        return ResponseEntity.ok(this.appointmentService.getAllAppointmentsByPetId(petId));
    }

    @Operation(
            summary = "Get appointments from a specific doctor",
            description = "Endpoint to retrieve an appointments from a specific doctor by their ID",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointments for the specified doctor retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Appointments for the specified doctor not found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> availableAppointmentsDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(this.appointmentService.getAvailableAppointmentsDoctorForToday(doctorId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<AppointmentResponseDTO>> getAvailableAppointments() {
        return ResponseEntity.ok(this.appointmentService.getAvailableAppointments());
    }


}
