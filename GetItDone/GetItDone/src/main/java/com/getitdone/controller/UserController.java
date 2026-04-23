package com.getitdone.controller;

import com.getitdone.dto.UpdateProfileRequest;
import com.getitdone.model.User;
import com.getitdone.repository.UserRepository;
import com.getitdone.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");

        var userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(userOpt.get());
    }

    // Service Preferences Management for Clients
    @PostMapping("/preferences")
    public ResponseEntity<?> addServicePreference(Principal principal,
            @RequestBody java.util.Map<String, String> payload) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");

        String preference = payload.get("preference");
        if (preference == null || preference.isBlank())
            return ResponseEntity.badRequest().body("Preference is required");

        var userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();
        if (user.getServicePreferences() == null)
            user.setServicePreferences(new ArrayList<>());

        if (!user.getServicePreferences().contains(preference)) {
            user.getServicePreferences().add(preference);
            userRepository.save(user);
        }
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/preferences/{preference}")
    public ResponseEntity<?> removeServicePreference(Principal principal, @PathVariable String preference) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");

        var userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();
        if (user.getServicePreferences() != null) {
            user.getServicePreferences().remove(preference);
            userRepository.save(user);
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updateServicePreferences(Principal principal,
            @RequestBody java.util.Map<String, java.util.List<String>> payload) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");

        java.util.List<String> preferences = payload.get("preferences");
        if (preferences == null)
            return ResponseEntity.badRequest().body("Preferences list is required");

        var userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();
        user.setServicePreferences(new ArrayList<>(preferences));
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/me/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(Principal principal, @ModelAttribute UpdateProfileRequest request) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");

        var userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        try {
            User updatedUser = userService.updateProfile(userOpt.get().getId(), request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update profile: " + e.getMessage());
        }
    }
}
