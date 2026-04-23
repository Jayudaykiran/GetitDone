package com.getitdone.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CalendarSlotDTO {
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String reason;
}
