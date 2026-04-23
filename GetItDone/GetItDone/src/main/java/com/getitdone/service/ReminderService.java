package com.getitdone.service;

import com.getitdone.model.Booking;
import com.getitdone.model.BookingStatus;
import com.getitdone.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@ConditionalOnProperty(name = "features.reminders.enabled", havingValue = "true", matchIfMissing = false)
public class ReminderService {
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final int windowStartHours;
    private final int windowEndHours;

    public ReminderService(BookingRepository bookingRepository, EmailService emailService,
            @Value("${reminder.window.start.hours:3}") int windowStartHours,
            @Value("${reminder.window.end.hours:4}") int windowEndHours) {
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.windowStartHours = windowStartHours;
        this.windowEndHours = windowEndHours;
    }

    @Scheduled(fixedDelayString = "${reminder.check.ms:1800000}")
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.plusHours(windowStartHours);
        LocalDateTime end = now.plusHours(windowEndHours);
        List<Booking> bookings = bookingRepository.findByStatusBetween(BookingStatus.CONFIRMED, start, end);
        for (Booking b : bookings) {
            // basic sending; production should track sent state
            emailService.sendSimpleMessage(b.getClient().getEmail(), "Upcoming Job Reminder",
                    "You have an upcoming job at " + b.getStartDateTime());
            emailService.sendSimpleMessage(b.getWorker().getUser().getEmail(), "Upcoming Job Reminder",
                    "You have an upcoming job at " + b.getStartDateTime());
        }
    }
}
