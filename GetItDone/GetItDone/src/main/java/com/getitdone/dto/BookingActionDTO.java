package com.getitdone.dto;

import lombok.Data;

@Data
public class BookingActionDTO {
    private String reason; // For cancellation or rejection after acceptance
}