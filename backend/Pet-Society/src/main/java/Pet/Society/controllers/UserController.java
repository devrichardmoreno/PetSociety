package Pet.Society.controllers;

import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.UserEntity;
import Pet.Society.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.Map;

@Tag(
        name = "User",
        description = "Controller for managing users"
)
@RestController
@RequestMapping("/user")
public class UserController {


    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(
            summary = "Update user",
            description = "Updates a user entity by ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "User updated successfully",
                            content = @Content(schema = @Schema(implementation = UserEntity.class))
                    )
            }
    )
    @PatchMapping("/update/{id}")
    public ResponseEntity<UserEntity> update(@Valid @RequestBody UserEntity user, @PathVariable long id) {
        this.userService.update(user, id);
        return ResponseEntity.ok(user);
    }

    @Operation(
            summary = "Unsubscribe user",
            description = "Marks a user as inactive by ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "User unsubscribed successfully",
                            content = @Content(schema = @Schema(implementation = String.class))
                    )
            }
    )
    @PatchMapping("/delete/{id}")
    public ResponseEntity<String> unsubscribe(@PathVariable long id) {
        this.userService.unSubscribe(id);
        return ResponseEntity.status(HttpStatus.OK).body("User unsubscribed successfully");
    }

    @Operation(
            summary = "Resubscribe user",
            description = "Reactivates a previously unsubscribed user by ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "User resubscribed successfully",
                            content = @Content(schema = @Schema(implementation = String.class))
                    )
            }
    )
    @PatchMapping("/resubscribe/{id}")
    public ResponseEntity<String> resubscribe(@PathVariable long id) {
        this.userService.reSubscribe(id);
        return ResponseEntity.status(HttpStatus.OK).body("User resubscribed successfully");
    }

    @Operation(
            summary = "Get all users with ADMIN role",
            description = "Returns a list of users with the ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of admin users retrieved successfully",
                            content = @Content(schema = @Schema(implementation = UserEntity.class))
                    )
            }
    )
    @GetMapping("/admin")
    public ResponseEntity<List<UserEntity>> getAdmins() {
        List<UserEntity> admins = userService.findByRole();
        return new ResponseEntity<>(admins, HttpStatus.OK);
    }



}
