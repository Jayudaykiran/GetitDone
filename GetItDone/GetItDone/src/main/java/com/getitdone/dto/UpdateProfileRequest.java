package com.getitdone.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDate dob;
    private String upiId;
    private MultipartFile profileImage;
    private String portfolioLink;
    private String linkedinLink;
    private MultipartFile cvFile;

    // Note: Aadhaar, PAN, and ID documents are NOT editable
}
