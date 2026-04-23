package com.getitdone.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class WorkerProfileResponse {
    private UUID id;
    private String fullName;
    private String subtype;
    private String jobRole;
    private Integer yearsExperience;
    private String bio;
    private String workType;
    private Double coverageRadiusKm;
    private String pricingType;
    private Double rate;
    private String paymentUpi;
    private Boolean availability;
    private Boolean verified;
    private Double rating;
    private String location;
}
