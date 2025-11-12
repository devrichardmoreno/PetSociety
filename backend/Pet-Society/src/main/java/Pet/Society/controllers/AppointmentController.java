package Pet.Society.controllers;
import Pet.Society.models.dto.appointment.AppointmentDTORequest;
import Pet.Society.config.OwnershipValidator;
import Pet.Society.models.dto.appointment.AppointmentDTO;
import Pet.Society.models.dto.appointment.AppointmentHistoryDTO;
import Pet.Society.models.dto.appointment.AppointmentResponseDTO;
import Pet.Society.models.dto.appointment.AppointmentScheduleDTO;
import Pet.Society.models.dto.appointment.AvailableAppointmentDTO;
import Pet.Society.models.dto.doctor.DoctorAvailabilityDTO;
import Pet.Society.models.enums.Reason;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


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

    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTORequest appointment) {
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

    @PatchMapping("approve/{id}")
    public ResponseEntity<AppointmentResponseDTO> approveAppointment(@PathVariable Long id){
        return ResponseEntity.ok(this.appointmentService.approveAppointment(id));
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
    public ResponseEntity<AppointmentResponseDTO> getAppointmentById(@PathVariable Long id) {
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

    @Operation(
            summary = "Get all appointments history from a specific client",
            description = "Endpoint to retrieve all appointments (SUCCESSFULLY, CANCELED, TO_BEGIN) from a specific client by their ID, ordered by date descending",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointments history for the specified client retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentHistoryDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Client not found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )
    @PreAuthorize("@ownershipValidator.canAccessClient(#clientId)")
    @GetMapping("/client/{clientId}/history")
    public ResponseEntity<List<AppointmentHistoryDTO>> getAppointmentsHistoryByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(this.appointmentService.getAllAppointmentsHistoryByClientId(clientId));
    }

    @PostMapping("uploadAvailability/{doctorId}")
    public ResponseEntity<String> uploadAvailabilityDoctor(@PathVariable long doctorId, @RequestBody DoctorAvailabilityDTO availabilityDTO){
            this.appointmentService.uploadAvailibility(doctorId,availabilityDTO);
            return ResponseEntity.ok("The hours was uploaded successfully");
    }

    @PostMapping("/create-multiple")
    public ResponseEntity<String> createMultipleAppointments(@RequestBody Pet.Society.models.dto.appointment.MultipleAppointmentsRequest request) {
        appointmentService.createMultipleAppointments(request.getDoctorId(), request.getStartDate(), request.getEndDate(), request.getReason());
        return ResponseEntity.ok("Multiple appointments created successfully.");
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
    @PreAuthorize("@ownershipValidator.canAccessPet(#petId)")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPetId(@PathVariable Long petId) {
        return ResponseEntity.ok(this.appointmentService.getAllAppointmentsByPetId(petId));
    }

    @Operation(
            summary = "Get all appointments from a specific pet including scheduled ones",
            description = "Endpoint to retrieve all appointments from a specific pet including TO_BEGIN status",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointments for the specified pet retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentEntity.class)
                            )
                    )
            }
    )
    @GetMapping("/pet/{petId}/all")
    @PreAuthorize("@ownershipValidator.canAccessPet(#petId)")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointmentsByPetIdIncludingScheduled(@PathVariable Long petId) {
        return ResponseEntity.ok(this.appointmentService.getAllAppointmentsByPetIdIncludingScheduled(petId));
    }

    @Operation(
            summary = "Get scheduled appointment ID by pet ID",
            description = "Endpoint to retrieve the ID of the scheduled appointment (TO_BEGIN) for a specific pet",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Appointment ID retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json"
                            )
                    )
            }
    )
    @GetMapping("/pet/{petId}/scheduled-id")
    @PreAuthorize("@ownershipValidator.canAccessPet(#petId)")
    public ResponseEntity<Long> getScheduledAppointmentIdByPetId(@PathVariable Long petId) {
        Long appointmentId = this.appointmentService.getScheduledAppointmentIdByPetId(petId);
        if (appointmentId == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(appointmentId);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        return ResponseEntity.ok(this.appointmentService.getAllAppointmets());
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
    public ResponseEntity<List<AppointmentScheduleDTO>> scheduleAppointmentsDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(this.appointmentService.getScheduleAppointmentsDoctorForToday(doctorId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<AppointmentResponseDTO>> getAvailableAppointments() {
        return ResponseEntity.ok(this.appointmentService.getAvailableAppointments());
    }

@Operation(
        summary = "Get available appointments by reason",
        description = "Endpoint to retrieve all available appointments for a specific reason (for calendar view)",
        responses = {
                @ApiResponse(
                        responseCode = "200",
                        description = "Available appointments retrieved successfully",
                        content = @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = AvailableAppointmentDTO.class)
                        )
                )
        }
)
@GetMapping("/available/reason/{reason}")
public ResponseEntity<List<AvailableAppointmentDTO>> getAvailableAppointmentsByReason(@PathVariable Reason reason) {
    return ResponseEntity.ok(this.appointmentService.getAvailableAppointmentsByReason(reason));
}

    @Operation(
            summary = "Get available appointments by reason and date",
            description = "Endpoint to retrieve available appointments for a specific reason and date (for time slots view)",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Available appointments for the date retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AvailableAppointmentDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/available/reason/{reason}/date")
    public ResponseEntity<List<AvailableAppointmentDTO>> getAvailableAppointmentsByReasonAndDate(
            @PathVariable Reason reason,
            @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(this.appointmentService.getAvailableAppointmentsByReasonAndDate(reason, localDate));
    }

@Operation(
        summary = "Get available days by reason",
        description = "Endpoint to retrieve unique days that have available appointments for a specific reason (for calendar highlighting)",
        responses = {
                @ApiResponse(
                        responseCode = "200",
                        description = "Available days retrieved successfully",
                        content = @Content(
                                mediaType = "application/json"
                        )
                )
        }
)
@GetMapping("/available/reason/{reason}/days")
public ResponseEntity<List<LocalDate>> getAvailableDaysByReason(@PathVariable Reason reason) {
    return ResponseEntity.ok(this.appointmentService.getAvailableDaysByReason(reason));
}

}
