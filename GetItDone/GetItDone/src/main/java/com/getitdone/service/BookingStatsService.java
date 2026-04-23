package com.getitdone.service;

import com.getitdone.dto.BookingStats;
import com.getitdone.model.Booking;
import com.getitdone.model.BookingStatus;
import com.getitdone.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;

@Service
public class BookingStatsService {
    private final BookingRepository bookingRepo;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public BookingStatsService(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    public BookingStats getClientStats(UUID clientId) {
        List<Booking> bookings = bookingRepo.findByClientId(clientId);
        return calculateStats(bookings, true);
    }

    public BookingStats getWorkerStats(UUID workerId) {
        List<Booking> bookings = bookingRepo.findByWorkerId(workerId);
        return calculateStats(bookings, false);
    }

    private BookingStats calculateStats(List<Booking> bookings, boolean isClientView) {
        long total = bookings.size();
        long completed = bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelled = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long rejected = bookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count();

        // For client view, both REJECTED and CANCELLED count as cancelled
        if (isClientView) {
            cancelled += rejected;
        }

        // Get cancellation details
        List<BookingStats.CancellationInfo> cancellations = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED || b.getStatus() == BookingStatus.REJECTED)
                .filter(b -> b.getCancellationReason() != null)
                .map(b -> BookingStats.CancellationInfo.builder()
                        .reason(b.getCancellationReason())
                        .cancelledBy(b.getStatus() == BookingStatus.CANCELLED ? "CLIENT" : "WORKER")
                        .bookingDate(b.getStartDateTime().format(DATE_FORMATTER))
                        .build())
                .collect(Collectors.toList());

        return BookingStats.builder()
                .totalBookings(total)
                .totalCompleted(completed)
                .totalCancelled(cancelled)
                .cancelledByClient(bookings.stream()
                        .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                        .count())
                .cancelledByWorker(bookings.stream()
                        .filter(b -> b.getStatus() == BookingStatus.REJECTED)
                        .count())
                .cancellationReasons(cancellations)
                .build();
    }
}