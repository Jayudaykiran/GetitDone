package com.getitdone.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String role; // CLIENT | WORKER
    private String jobTitle; // For worker role
    private String phoneNumber; // Changed from 'phone' to match frontend
    private String address;
    private String aadhaarOrPanNumber; // Single field for Aadhaar or PAN
    private String upiId;
    private LocalDate dob;
    private MultipartFile profileImage; // Mandatory profile photo
    private MultipartFile idDocumentImage; // Aadhaar/PAN image (mandatory)
    private MultipartFile cvFile; // Optional CV (Professional Worker only)
    private String portfolioLink; // Optional portfolio link
    private String linkedinLink; // Optional LinkedIn link
    private Boolean professionalWorker; // Flag to indicate professional worker
    private List<String> servicePreferences = new ArrayList<>(); // Default empty list
}
