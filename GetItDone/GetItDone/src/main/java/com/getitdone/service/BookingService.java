// ...existing code...
package com.getitdone.service;

import com.getitdone.dto.BookingRequestDTO;
import com.getitdone.model.Booking;
import com.getitdone.model.BookingStatus;
import com.getitdone.model.User;
import com.getitdone.model.WorkerProfile;
import com.getitdone.repository.BookingRepository;
import com.getitdone.repository.CalendarBlockRepository;
import com.getitdone.repository.WorkerProfileRepository;
import com.getitdone.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class BookingService {
        public Booking rejectBooking(UUID bookingId, UUID workerId, String reason) {
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
                if (!booking.getWorker().getId().equals(workerId))
                        throw new IllegalArgumentException("Not authorized");

                // If booking was CONFIRMED, reason is required
                if (booking.getStatus() == BookingStatus.CONFIRMED && (reason == null || reason.trim().isEmpty())) {
                        throw new IllegalArgumentException("Reason is required when rejecting after acceptance");
                }

                booking.setStatus(BookingStatus.REJECTED);
                booking.setCancellationReason(reason);
                Booking saved = bookingRepository.save(booking);

                // notify client
                String message = reason != null ? "Your booking has been rejected by the worker. Reason: " + reason
                                : "Your booking has been rejected by the worker.";
                emailService.sendSimpleMessage(booking.getClient().getEmail(), "Booking rejected", message);

                return saved;
        }

        public Booking cancelBooking(UUID bookingId, UUID clientId, String reason) {
                if (reason == null || reason.trim().isEmpty()) {
                        throw new IllegalArgumentException("Reason is required for cancellation");
                }

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
                if (!booking.getClient().getId().equals(clientId))
                        throw new IllegalArgumentException("Not authorized");

                booking.setStatus(BookingStatus.CANCELLED);
                booking.setCancellationReason(reason);
                Booking saved = bookingRepository.save(booking);

                // notify worker
                String message = "Booking has been cancelled by the client. Reason: " + reason;
                emailService.sendSimpleMessage(booking.getWorker().getUser().getEmail(),
                                "Booking cancelled", message);

                return saved;
        }

        public Booking completeBooking(UUID bookingId, UUID workerId) {
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
                if (!booking.getWorker().getId().equals(workerId))
                        throw new IllegalArgumentException("Not authorized");
                booking.setStatus(BookingStatus.COMPLETED);
                Booking saved = bookingRepository.save(booking);
                // notify client
                emailService.sendSimpleMessage(booking.getClient().getEmail(), "Booking completed",
                                "Your booking has been marked as completed by the worker.");
                return saved;
        }

        public java.util.List<Booking> getBookingsForClient(UUID clientId) {
                return bookingRepository.findAll().stream()
                                .filter(b -> b.getClient().getId().equals(clientId))
                                .toList();
        }

        public java.util.List<Booking> getBookingsForWorker(UUID workerId) {
                return bookingRepository.findAll().stream()
                                .filter(b -> b.getWorker().getId().equals(workerId))
                                .toList();
        }

        private final BookingRepository bookingRepository;
        private final WorkerProfileRepository workerRepo;
        private final UserRepository userRepository;
        private final CalendarBlockRepository blockRepo;
        private final EmailService emailService;

        public BookingService(BookingRepository bookingRepository, WorkerProfileRepository workerRepo,
                        UserRepository userRepository, CalendarBlockRepository blockRepo, EmailService emailService) {
                this.bookingRepository = bookingRepository;
                this.workerRepo = workerRepo;
                this.userRepository = userRepository;
                this.blockRepo = blockRepo;
                this.emailService = emailService;
        }

        public Booking requestBooking(UUID clientId, BookingRequestDTO dto) {
                // validate worker exists
                WorkerProfile worker = workerRepo.findById(dto.getWorkerId())
                                .orElseThrow(() -> new IllegalArgumentException("Worker not found"));
                User client = userRepository.findById(clientId)
                                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

                // date validation
                LocalDate today = LocalDate.now();
                if (dto.getStartDateTime().toLocalDate().isAfter(today.plusDays(3))) {
                        throw new IllegalArgumentException("Bookings can only be made within the next 3 days.");
                }

                // overlap checks
                boolean conflict = bookingRepository.existsConfirmedOverlap(worker.getId(), dto.getStartDateTime(),
                                dto.getEndDateTime()) ||
                                blockRepo.existsOverlap(worker.getId(), dto.getStartDateTime(), dto.getEndDateTime());
                if (conflict)
                        throw new IllegalArgumentException("Worker not available at this time");

                Booking b = Booking.builder()
                                .worker(worker)
                                .client(client)
                                .description(dto.getDescription())
                                .startDateTime(dto.getStartDateTime())
                                .endDateTime(dto.getEndDateTime())
                                .location(dto.getLocation())
                                .status(BookingStatus.PENDING)
                                .build();
                Booking saved = bookingRepository.save(b);

                // notify worker
                emailService.sendSimpleMessage(worker.getUser().getEmail(), "New booking request",
                                "You have a new booking request.");

                return saved;
        }

        public Booking acceptBooking(UUID bookingId, UUID workerId) {
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
                if (!booking.getWorker().getId().equals(workerId))
                        throw new IllegalArgumentException("Not authorized");
                booking.setStatus(BookingStatus.CONFIRMED);
                Booking saved = bookingRepository.save(booking);
                // notify client
                emailService.sendSimpleMessage(booking.getClient().getEmail(), "Booking confirmed",
                                "Your booking has been confirmed by the worker.");
                return saved;
        }

        public UUID resolveUserIdByEmail(String email) {
                return userRepository.findByEmail(email).map(u -> u.getId())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        public UUID resolveWorkerProfileIdByEmail(String email) {
                UUID userId = resolveUserIdByEmail(email);
                return workerRepo.findAll().stream().filter(w -> w.getUser().getId().equals(userId)).findFirst()
                                .map(w -> w.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Worker profile not found for user"));
        }
}
