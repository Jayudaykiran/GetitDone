package com.getitdone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerDTO {
    private UUID id;
    private String subtype;
    private String jobRole;
    private Integer yearsExperience;
    private String bio;
    private String workType;
    private Double coverageRadiusKm;
    private String pricingType;
    private Double rate;
    private String paymentUpi;
    private String paymentBankAcc;
    private String paymentIfsc;
    private Boolean availability;
    private Boolean verified;
    private List<String> skills;
    private List<String> workCategories;

    // Nested user data
    private UserDTO user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDTO {
        private UUID id;
        private String uniqueUserCode;
        private String fullName;
        private String jobTitle;
        private String email;
        private String phone;
        private String address;
        private String profileImagePath;
        private String cvPath;
        private String portfolioLink;
        private String linkedinLink;
    }
}
