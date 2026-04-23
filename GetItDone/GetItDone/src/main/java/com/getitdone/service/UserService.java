package com.getitdone.service;

import com.getitdone.dto.RegisterRequest;
import com.getitdone.dto.UpdateProfileRequest;
import com.getitdone.model.User;
import com.getitdone.model.UserRole;
import com.getitdone.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final String UPLOAD_DIR_PROFILE = "uploads/profile/";
    private static final String UPLOAD_DIR_ID_DOCS = "uploads/id_docs/";
    private static final String UPLOAD_DIR_CV = "uploads/cv/";
    private static final String UPLOAD_DIR_DOCUMENTS = "uploads/documents/"; // Legacy support

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private String generateUniqueUserCode() {
        String lastCode = userRepository.findTopByUniqueUserCodeIsNotNullOrderByUniqueUserCodeDesc()
                .map(u -> u.getUniqueUserCode())
                .orElse("260");
        int nextNumber = Integer.parseInt(lastCode) + 1;
        return String.valueOf(nextNumber);
    }

    private String saveFile(MultipartFile file, String directory) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Create upload directory if it doesn't exist
        File uploadDir = new File(directory);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID().toString() + extension;

        Path filePath = Paths.get(directory + filename);
        Files.write(filePath, file.getBytes());

        return filePath.toString();
    }

    private String saveDocumentImage(MultipartFile file) throws IOException {
        return saveFile(file, UPLOAD_DIR_DOCUMENTS);
    }

    @Transactional
    public User register(RegisterRequest r) {
        // Validate email uniqueness
        Optional<User> exists = userRepository.findByEmail(r.getEmail());
        if (exists.isPresent())
            throw new IllegalArgumentException("Email already in use");

        // Validate mandatory fields
        if (r.getUpiId() == null || r.getUpiId().trim().isEmpty()) {
            throw new IllegalArgumentException("UPI ID is required");
        }

        if (r.getDob() == null) {
            throw new IllegalArgumentException("Date of Birth is required");
        }

        if (r.getAadhaarOrPanNumber() == null || r.getAadhaarOrPanNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Aadhaar or PAN number is required");
        }

        if (r.getProfileImage() == null || r.getProfileImage().isEmpty()) {
            throw new IllegalArgumentException("Profile image is required");
        }

        if (r.getIdDocumentImage() == null || r.getIdDocumentImage().isEmpty()) {
            throw new IllegalArgumentException("Aadhaar/PAN document image is required");
        }

        // Save profile image
        String profileImagePath = null;
        try {
            profileImagePath = saveFile(r.getProfileImage(), UPLOAD_DIR_PROFILE);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage());
        }

        // Save ID document image
        String documentPath = null;
        try {
            documentPath = saveFile(r.getIdDocumentImage(), UPLOAD_DIR_ID_DOCS);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload ID document: " + e.getMessage());
        }

        // Save CV if provided (Professional Worker only)
        String cvPath = null;
        if (r.getCvFile() != null && !r.getCvFile().isEmpty()) {
            try {
                cvPath = saveFile(r.getCvFile(), UPLOAD_DIR_CV);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload CV: " + e.getMessage());
            }
        }

        String uniqueCode = generateUniqueUserCode();

        // Determine if Aadhaar or PAN based on length (Aadhaar=12 digits, PAN=10
        // alphanumeric)
        String aadhaarNo = null;
        String panNo = null;
        String idNumber = r.getAadhaarOrPanNumber().trim();
        if (idNumber.matches("\\d{12}")) {
            aadhaarNo = idNumber;
        } else if (idNumber.matches("[A-Z]{5}\\d{4}[A-Z]")) {
            panNo = idNumber;
        } else {
            // If format doesn't match, store in aadhaarNo field
            aadhaarNo = idNumber;
        }

        User u = User.builder()
                .fullName(r.getFullName())
                .email(r.getEmail())
                .password(passwordEncoder.encode(r.getPassword()))
                .role("WORKER".equalsIgnoreCase(r.getRole()) ? UserRole.WORKER : UserRole.CLIENT)
                .jobTitle(r.getJobTitle())
                .phone(r.getPhoneNumber())
                .address(r.getAddress())
                .aadhaarNo(aadhaarNo)
                .panNo(panNo)
                .upiId(r.getUpiId())
                .dob(r.getDob())
                .documentPath(documentPath)
                .profileImagePath(profileImagePath)
                .cvPath(cvPath)
                .portfolioLink(r.getPortfolioLink())
                .linkedinLink(r.getLinkedinLink())
                .uniqueUserCode(uniqueCode)
                .build();
        return userRepository.save(u);
    }

    @Transactional
    public User updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update editable fields
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhone(request.getPhoneNumber());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }

        if (request.getUpiId() != null && !request.getUpiId().trim().isEmpty()) {
            user.setUpiId(request.getUpiId());
        }

        if (request.getPortfolioLink() != null) {
            user.setPortfolioLink(request.getPortfolioLink());
        }

        if (request.getLinkedinLink() != null) {
            user.setLinkedinLink(request.getLinkedinLink());
        }

        // Update profile image if provided
        if (request.getProfileImage() != null && !request.getProfileImage().isEmpty()) {
            try {
                String newProfileImagePath = saveFile(request.getProfileImage(), UPLOAD_DIR_PROFILE);
                user.setProfileImagePath(newProfileImagePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload profile image: " + e.getMessage());
            }
        }

        // Update CV if provided
        if (request.getCvFile() != null && !request.getCvFile().isEmpty()) {
            try {
                String newCvPath = saveFile(request.getCvFile(), UPLOAD_DIR_CV);
                user.setCvPath(newCvPath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload CV: " + e.getMessage());
            }
        }

        return userRepository.save(user);
    }

    @Transactional
    public void resetPassword(String identifier, String newPassword) {
        User user;

        // Check if identifier is email or phone
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        } else {
            user = userRepository.findByPhone(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        // Update password with encoded version
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
