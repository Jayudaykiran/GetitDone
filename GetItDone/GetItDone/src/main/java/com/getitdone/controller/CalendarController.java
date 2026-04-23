package com.getitdone.controller;

import com.getitdone.model.Booking;
import com.getitdone.repository.BookingRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {
    private final BookingRepository bookingRepository;

    public CalendarController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/{workerId}")
    public ResponseEntity<List<Booking>> getCalendar(@PathVariable UUID workerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        if (from == null)
            from = LocalDateTime.now().minusYears(1);
        if (to == null)
            to = LocalDateTime.now().plusYears(1);
        List<Booking> events = bookingRepository.findAll().stream().filter(b -> b.getWorker().getId().equals(workerId))
                .toList();
        return ResponseEntity.ok(events);
    }
}
