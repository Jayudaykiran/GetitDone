package com.getitdone.dto;

import lombok.Data;

@Data
public class WorkerProfileRequest {
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
}
