package com.getitdone.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.getitdone.config.StringListConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(unique = true, nullable = false, updatable = false)
    private String uniqueUserCode; // e.g., 261, 262, ...

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String phone;
    private String address;
    private String aadhaarNo;
    private String panNo;
    private String upiId;
    private LocalDate dob;
    private String documentPath;
    private String profileImagePath;
    private String cvPath;
    private String portfolioLink;
    private String linkedinLink;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "text")
    @Builder.Default
    private List<String> servicePreferences = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
