package com.getitdone.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerProfile {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String subtype; // PROFESSIONAL | SKILLED
    private String jobRole;
    private Integer yearsExperience;
    @Column(columnDefinition = "text")
    private String bio;
    private String workType; // ONLINE | OFFLINE | BOTH
    private Double coverageRadiusKm;
    private String pricingType; // PER_HOUR | PER_DAY | PER_PROJECT
    private Double rate;
    private String paymentUpi;
    private String paymentBankAcc;
    private String paymentIfsc;
    private Boolean availability;
    private Boolean verified;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<String> workCategories = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
        if (availability == null)
            availability = true;
        if (verified == null)
            verified = false;
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
