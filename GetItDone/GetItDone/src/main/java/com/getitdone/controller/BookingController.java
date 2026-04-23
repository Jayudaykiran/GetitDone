package com.getitdone.controller;

import com.getitdone.dto.BookingActionDTO;
import com.getitdone.dto.BookingRequestDTO;
import com.getitdone.model.Booking;
import com.getitdone.service.BookingService;
import com.getitdone.service.BookingStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    private final BookingStatsService bookingStatsService;

    public BookingController(BookingService bookingService, BookingStatsService bookingStatsService) {
        this.bookingService = bookingService;
        this.bookingStatsService = bookingStatsService;
    }

    @PostMapping
    public ResponseEntity<?> requestBooking(@RequestBody BookingRequestDTO dto, Authentication authentication) {
        // resolve current user by email (subject)
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            // bookingService will accept client UUID resolved internally
            java.util.UUID clientId = bookingService.resolveUserIdByEmail(email);
            Booking b = bookingService.requestBooking(clientId, dto);
            return ResponseEntity.ok(b);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Alias to satisfy required endpoint: /api/bookings/create
    @PostMapping("/create")
    public ResponseEntity<?> requestBookingAlias(@RequestBody BookingRequestDTO dto, Authentication authentication) {
        return requestBooking(dto, authentication);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable UUID id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            java.util.UUID workerId = bookingService.resolveWorkerProfileIdByEmail(email);
            Booking b = bookingService.acceptBooking(id, workerId);
            return ResponseEntity.ok(b);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Alias to satisfy required endpoint: /api/bookings/accept/{id}
    @PutMapping("/accept/{id}")
    public ResponseEntity<?> acceptAlias(@PathVariable UUID id, Authentication authentication) {
        return accept(id, authentication);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable UUID id, @RequestBody(required = false) BookingActionDTO action,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            java.util.UUID workerId = bookingService.resolveWorkerProfileIdByEmail(email);
            Booking b = bookingService.rejectBooking(id, workerId, action != null ? action.getReason() : null);
            return ResponseEntity.ok(b);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Alias to satisfy required endpoint: /api/bookings/reject/{id}
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectAlias(@PathVariable UUID id, @RequestBody(required = false) BookingActionDTO action,
            Authentication authentication) {
        return reject(id, action, authentication);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable UUID id, @RequestBody BookingActionDTO action,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            java.util.UUID clientId = bookingService.resolveUserIdByEmail(email);
            Booking b = bookingService.cancelBooking(id, clientId, action.getReason());
            return ResponseEntity.ok(b);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Alias to satisfy required endpoint: /api/bookings/cancel/{id}
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelAlias(@PathVariable UUID id, @RequestBody BookingActionDTO action,
            Authentication authentication) {
        return cancel(id, action, authentication);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable UUID id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            java.util.UUID workerId = bookingService.resolveWorkerProfileIdByEmail(email);
            Booking b = bookingService.completeBooking(id, workerId);
            return ResponseEntity.ok(b);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/client")
    public ResponseEntity<?> getClientBookings(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            java.util.UUID clientId = bookingService.resolveUserIdByEmail(email);
            return ResponseEntity.ok(bookingService.getBookingsForClient(clientId));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/worker")
    public ResponseEntity<?> getWorkerBookings(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            java.util.UUID workerId = bookingService.resolveWorkerProfileIdByEmail(email);
            return ResponseEntity.ok(bookingService.getBookingsForWorker(workerId));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Required endpoint: /api/bookings/my?role=client|worker
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(Authentication authentication,
            @RequestParam(required = false) String role) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");
        try {
            if ("worker".equalsIgnoreCase(role)) {
                UUID workerId = bookingService.resolveWorkerProfileIdByEmail(email);
                return ResponseEntity.ok(bookingService.getBookingsForWorker(workerId));
            } else {
                UUID clientId = bookingService.resolveUserIdByEmail(email);
                return ResponseEntity.ok(bookingService.getBookingsForClient(clientId));
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication,
            @RequestParam(required = false) String role) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null)
            return ResponseEntity.status(401).body("Unauthorized");

        try {
            if ("worker".equalsIgnoreCase(role)) {
                UUID workerId = bookingService.resolveWorkerProfileIdByEmail(email);
                return ResponseEntity.ok(bookingStatsService.getWorkerStats(workerId));
            } else {
                UUID clientId = bookingService.resolveUserIdByEmail(email);
                return ResponseEntity.ok(bookingStatsService.getClientStats(clientId));
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
