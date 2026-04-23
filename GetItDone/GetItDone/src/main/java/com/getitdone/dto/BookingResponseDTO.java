package com.getitdone.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BookingResponseDTO {
    private UUID id;
    private String workerName;
    private String clientName;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String status;
    private String location;
}
