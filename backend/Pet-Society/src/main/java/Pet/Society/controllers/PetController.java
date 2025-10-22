package Pet.Society.controllers;

import Pet.Society.models.dto.pet.PetDTO;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.services.PetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@Tag(
        name = "Pet",
        description = "Controller for managing pets"
)
@RestController
@RequestMapping("/pet")
public class PetController {


    private final PetService petService;

    @Autowired
    public PetController(PetService petService) {
        this.petService = petService;
    }


    @Operation(
            summary = "Create a new pet",
            description = "Endpoint to register a new pet to a client.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Pet created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PetEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid input data",
                            content = @Content(
                                    mediaType = "application/json"
                            )
                    )
            }
    )
    @PostMapping("/create")
    @PreAuthorize("@ownershipValidator.canAccessPet(#dto.clientId)")
    public ResponseEntity<PetDTO> createPet(@Valid @RequestBody PetDTO dto) {
        return ResponseEntity.ok(petService.createPet(dto));
    }

    @Operation(
            summary = "Update an existing pet",
            description = "Endpoint to update pet data based on its ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Pet updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PetEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Pet not found",
                            content = @Content(
                                    mediaType = "application/json"
                            )
                    )
            }
    )
    @PatchMapping("/update/{id}")
    @PreAuthorize("@ownershipValidator.canAccessPet(#id)")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Long id, @RequestBody PetDTO dto) {
        return ResponseEntity.ok(petService.updatePet(id, dto));
    }

    @Operation(
            summary = "Unsubscribe a pet (soft delete)",
            description = "Sets the pet's active status to false instead of deleting from database.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Pet unsubscribed successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PetEntity.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Pet not found",
                            content = @Content(
                                    mediaType = "application/json"
                            )
                    )
            }
    )
    @DeleteMapping("/deleteActive/{id}")
    //NOT WORKS
    public ResponseEntity<String> deleteActive(@PathVariable Long id) {
        this.petService.deletePet(id);
        return ResponseEntity.ok("Pet unsubscribed successfully");
    }


    @Operation(
            summary = "Get pet by ID",
            description = "Retrieves a pet and maps it to a DTO by its unique ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Pet found successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PetDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Pet not found",
                            content = @Content(
                                    mediaType = "application/json"
                            )
                    )
            }
    )
    @GetMapping("/findByID/{id}")
    @PreAuthorize("@ownershipValidator.canAccessPet(#id)")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }

    @Operation(
            summary = "Get all pets for a given client",
            description = "Retrieves all pets associated with a specific client ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Pets retrieved successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PetDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/findAllByClientId/{id}")
    @PreAuthorize("@ownershipValidator.canAccessPet(#id)")
    public ResponseEntity<List<PetDTO>> getAllPetsByClientId(@PathVariable("id") Long id) {
        return new ResponseEntity<>(this.petService.getAllPetsByClientId(id), HttpStatus.OK);
    }
    @PreAuthorize("@ownershipValidator.canAccessClient(#dni)")
    @GetMapping("/seeMyPets/{dni}")
    public ResponseEntity<List<PetDTO>> SeeMyPets(@PathVariable("dni") String dni) {
        return ResponseEntity.ok(this.petService.seeMyPets(dni));
    }



}
