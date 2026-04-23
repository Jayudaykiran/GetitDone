package com.getitdone.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingStats {
    private long totalBookings;
    private long totalCompleted;
    private long totalCancelled;
    private long cancelledByClient;
    private long cancelledByWorker;
    private java.util.List<CancellationInfo> cancellationReasons;

    @Data
    @Builder
    public static class CancellationInfo {
        private String reason;
        private String cancelledBy; // "CLIENT" or "WORKER"
        private String bookingDate;
    }
}