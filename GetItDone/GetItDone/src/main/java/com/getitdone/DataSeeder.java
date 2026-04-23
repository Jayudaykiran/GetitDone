package com.getitdone;

import com.getitdone.model.*;
import com.getitdone.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Configuration
@Profile("!dev")  // Disable DataSeeder in dev profile (uses H2 in-memory DB)
public class DataSeeder {
    @Bean
    public CommandLineRunner seedData(UserRepository userRepo, WorkerProfileRepository workerRepo,
            BookingRepository bookingRepo, PasswordEncoder encoder) {
        return args -> {
            if (userRepo.count() == 0) {
                User client = User.builder()
                        .id(UUID.randomUUID())
                        .uniqueUserCode("261")
                        .fullName("Test Client")
                        .email("client@getitdone.com")
                        .password(encoder.encode("password"))
                        .role(UserRole.CLIENT)
                        .phone("9999999999")
                        .address("Hyderabad")
                        .aadhaarNo("123412341234")
                        .upiId("client@upi")
                        .dob(LocalDate.of(1990, 1, 1))
                        .build();
                userRepo.save(client);

                User workerUser = User.builder()
                        .id(UUID.randomUUID())
                        .uniqueUserCode("262")
                        .fullName("Test Worker")
                        .email("worker@getitdone.com")
                        .password(encoder.encode("password"))
                        .role(UserRole.WORKER)
                        .phone("8888888888")
                        .address("Hyderabad")
                        .aadhaarNo("432143214321")
                        .upiId("worker@upi")
                        .dob(LocalDate.of(1992, 2, 2))
                        .build();
                userRepo.save(workerUser);

                WorkerProfile profile = WorkerProfile.builder()
                        .id(UUID.randomUUID())
                        .user(workerUser)
                        .subtype("Professional")
                        .jobRole("Electrician")
                        .yearsExperience(5)
                        .bio("Experienced electrician for home and office work.")
                        .workType("Offline")
                        .coverageRadiusKm(10.0)
                        .pricingType("PER_HOUR")
                        .rate(300.0)
                        .paymentUpi("worker@upi")
                        .availability(true)
                        .verified(true)
                        .build();
                workerRepo.save(profile);

                Booking booking = Booking.builder()
                        .id(UUID.randomUUID())
                        .worker(profile)
                        .client(client)
                        .description("Fix kitchen lights")
                        .startDateTime(LocalDateTime.now().plusDays(1))
                        .endDateTime(LocalDateTime.now().plusDays(1).plusHours(2))
                        .location("Client Home")
                        .status(BookingStatus.CONFIRMED)
                        .build();
                bookingRepo.save(booking);
            }
        };
    }
}
