package Pet.Society.controllers;

import Pet.Society.models.dto.diagnoses.DiagnosesDTO;
import Pet.Society.models.dto.diagnoses.DiagnosesDTOResponse;
import Pet.Society.models.entities.DiagnosesEntity;
import Pet.Society.services.DiagnosesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(
        name = "Diagnoses",
        description = "Controller for managing diagnoses"
)
@RestController
@RequestMapping("/diagnoses")
public class DiagnosesController {

    private final DiagnosesService diagnosesService;

    @Autowired
    public DiagnosesController(DiagnosesService diagnosesService) {
        this.diagnosesService = diagnosesService;
    }

    @Operation(
            summary = "Create a new diagnosis",
            description = "Endpoint to create a new diagnosis based on the provided DTO.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Diagnosis created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = DiagnosesEntity.class)
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
    public ResponseEntity<DiagnosesDTO> createDiagnosis(@RequestBody DiagnosesDTO dto) {
        return new ResponseEntity<>(this.diagnosesService.save(dto), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get diagnosis by ID",
            description = "Endpoint to retrieve a diagnosis using its ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Diagnosis found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = DiagnosesEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Diagnosis not found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )
    @GetMapping("/findById/{id}")
    public ResponseEntity<DiagnosesDTOResponse> getDiagnosisById(@PathVariable Long id) {
        DiagnosesDTOResponse diagnosis = diagnosesService.findById(id);
        return ResponseEntity.ok(diagnosis);
    }

    @Operation(
            summary = "Get last diagnosis by pet ID",
            description = "Retrieves the latest diagnosis for a pet by its ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Last diagnosis retrieved",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = DiagnosesDTOResponse.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "No diagnosis found for the given pet ID",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = String.class)
                            )
                    )
            }
    )
    @GetMapping("/getLastDiagnoses/{id}")
    public ResponseEntity<DiagnosesDTOResponse> getLastDiagnoses(@PathVariable long id) {
        return ResponseEntity.ok(diagnosesService.findLastById(id));
    }

    @Operation(
            summary = "Get diagnoses by pet ID",
            description = "Retrieves a paginated list of diagnoses for a given pet.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Diagnoses retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)
                            )
                    )
            }
    )
    @GetMapping("getByPetId/{id}")
    @PreAuthorize("@ownershipValidator.canAccessPet(#id)")
    public ResponseEntity<Page<DiagnosesDTOResponse>> getByPetId(@PageableDefault(size = 10, page = 0) Pageable pageable, @PathVariable long id) {
        return ResponseEntity.ok(diagnosesService.findByPetId(id, pageable));
    }

    @Operation(
            summary = "Get all diagnoses",
            description = "Retrieves a paginated list of all diagnoses in the system.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Diagnoses retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)
                            )
                    )
            }
    )
    @GetMapping("/getAll")
    public ResponseEntity<Page<DiagnosesDTOResponse>> getAllDiagnoses(@PageableDefault(size = 10, page = 0) Pageable pageable) {
        return ResponseEntity.ok(diagnosesService.findAll(pageable));
    }
    @PreAuthorize("@ownershipValidator.canAccessClient(#id)")
    @GetMapping("/lastDiagnoses/{id}")
    public ResponseEntity<Page<DiagnosesDTOResponse>> getClientLastDiagnoses(@PathVariable long id, @PageableDefault(size = 10, page = 0) Pageable pageable){
        return ResponseEntity.ok(diagnosesService.findByPetClientId(id,pageable));
    }

    @Operation(
            summary = "Get diagnoses by doctor ID",
            description = "Retrieves a paginated list of diagnoses assigned to a specific doctor.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Diagnoses retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class)
                            )
                    )
            }
    )
    @GetMapping("/getByDoctorId/{id}")
    public ResponseEntity<Page<DiagnosesDTOResponse>> getByDoctorId(@PathVariable long id, @PageableDefault(size = 10, page = 0) Pageable pageable) {
        return ResponseEntity.ok(diagnosesService.findByDoctorId(id, pageable));
    }



}
