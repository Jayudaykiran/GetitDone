package com.getitdone.dto;

import com.getitdone.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UUID userId;
    private String email;
    private String fullName;
    private String uniqueUserCode;
    private UserRole role;
    private String jobTitle;
    private String message;
}
