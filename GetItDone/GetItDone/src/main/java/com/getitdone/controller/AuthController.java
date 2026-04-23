package com.getitdone.controller;

import com.getitdone.dto.AuthRequest;
import com.getitdone.dto.AuthResponse;
import com.getitdone.dto.RegisterRequest;
import com.getitdone.model.User;
import com.getitdone.security.JwtUtil;
import com.getitdone.service.UserService;
import com.getitdone.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
        "http://localhost:5176" }, allowCredentials = "true")
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtUtil jwtUtil,
            UserDetailsService userDetailsService, UserRepository userRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(@ModelAttribute RegisterRequest r) {
        try {
            System.out.println("=== REGISTRATION REQUEST RECEIVED ===");
            System.out.println("Full Name: " + r.getFullName());
            System.out.println("Email: " + r.getEmail());
            System.out.println("Phone: " + r.getPhoneNumber());
            System.out.println("Role: " + r.getRole());
            System.out.println("Aadhaar/PAN: " + r.getAadhaarOrPanNumber());
            System.out.println("UPI: " + r.getUpiId());
            System.out.println("DOB: " + r.getDob());
            System.out.println("Profile Image: "
                    + (r.getProfileImage() != null ? r.getProfileImage().getOriginalFilename() : "null"));
            System.out.println("ID Document Image: "
                    + (r.getIdDocumentImage() != null ? r.getIdDocumentImage().getOriginalFilename() : "null"));
            System.out.println("Professional Worker: " + r.getProfessionalWorker());
            System.out.println("CV File: "
                    + (r.getCvFile() != null ? r.getCvFile().getOriginalFilename() : "null"));
            System.out.println("=====================================");

            User user = userService.register(r);

            System.out.println("✅ User registered successfully: " + user.getEmail());

            AuthResponse response = AuthResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .uniqueUserCode(user.getUniqueUserCode())
                    .role(user.getRole())
                    .jobTitle(user.getJobTitle())
                    .message("User registered successfully")
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Registration failed (validation): " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Registration failed (error): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            UserDetails ud = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtUtil.generateToken(ud.getUsername());

            User user = userRepository.findByEmail(ud.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .uniqueUserCode(user.getUniqueUserCode())
                    .role(user.getRole())
                    .jobTitle(user.getJobTitle())
                    .build();

            return ResponseEntity.ok(response);
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/check-user")
    public ResponseEntity<?> checkUser(@RequestBody java.util.Map<String, String> payload) {
        String identifier = payload.get("identifier");
        if (identifier == null || identifier.isBlank()) {
            return ResponseEntity.badRequest().body("Identifier is required");
        }

        // Check if identifier is email or phone
        boolean exists = false;
        if (identifier.contains("@")) {
            // Email
            exists = userRepository.findByEmail(identifier).isPresent();
        } else {
            // Phone number
            exists = userRepository.findByPhone(identifier).isPresent();
        }

        java.util.Map<String, Boolean> response = new java.util.HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> payload) {
        String identifier = payload.get("identifier");
        String newPassword = payload.get("newPassword");

        if (identifier == null || identifier.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Identifier and new password are required");
        }

        try {
            userService.resetPassword(identifier, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
