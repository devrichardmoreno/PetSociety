package Pet.Society.controllers;

import Pet.Society.models.dto.doctor.DoctorDTO;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.services.DoctorService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(
        name = "Doctor",
        description = "Controller for managing doctors"
)
@RestController
@RequestMapping("/doctor")
public class DoctorController {


    private final DoctorService doctorService;

    @Autowired
    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }


    @Operation(
            summary = "Update an existing doctor",
            description = "Updates an existing doctor by ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Doctor updated successfully",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DoctorEntity.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Doctor not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PatchMapping("/update/{id}")
    public ResponseEntity<DoctorDTO> updateDoctor(@Valid @RequestBody DoctorDTO doctor, @PathVariable Long id) {
        return new ResponseEntity<>(doctorService.update(doctor, id), HttpStatus.OK);
    }

    @Operation(
            summary = "Unsubscribe a doctor",
            description = "Marks a doctor as unsubscribed by ID (soft delete or status change).",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Doctor unsubscribed successfully",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Doctor not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PatchMapping("/unsubscribe/{id}")
    public ResponseEntity<String> unsuscribe(@PathVariable Long id) {
        doctorService.unSubscribe(id);
        return ResponseEntity.ok("Unsubscribed successfully");
    }

    @Operation(
            summary = "Find doctor by ID",
            description = "Retrieves a doctor by their database ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Doctor found",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DoctorEntity.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Doctor not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/find/{id}")
    public ResponseEntity<DoctorDTO> findById(@PathVariable Long id) {
        return new ResponseEntity<>(doctorService.findById(id), HttpStatus.OK);
    }

    @Operation(
            summary = "Find doctor by DNI",
            description = "Retrieves a doctor using their unique DNI.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Doctor found",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DoctorEntity.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Doctor not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/find/dni/{dni}")
    public ResponseEntity<DoctorDTO> findByDNI (@PathVariable String dni){
        return new ResponseEntity<>(doctorService.findByDni(dni), HttpStatus.OK);
    }

}
