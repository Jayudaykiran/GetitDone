package com.getitdone.service;

import com.getitdone.dto.WorkerDTO;
import com.getitdone.dto.WorkerSearchRequest;
import com.getitdone.model.WorkerProfile;
import com.getitdone.repository.WorkerProfileRepository;
import com.getitdone.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerService {
    private final WorkerProfileRepository workerRepo;
    private final BookingRepository bookingRepo;

    public WorkerService(WorkerProfileRepository workerRepo, BookingRepository bookingRepo) {
        this.workerRepo = workerRepo;
        this.bookingRepo = bookingRepo;
    }

    public List<WorkerDTO> searchAvailableWorkers(WorkerSearchRequest request) {
        System.out.println("[DEBUG] searchAvailableWorkers called with: " + request);
        List<WorkerProfile> workers = workerRepo.findAll();
        System.out.println("[DEBUG] Total workers in database: " + workers.size());

        // Filter by availability - only filter if explicitly set to false
        workers = workers.stream()
                .filter(w -> w.getAvailability() == null || w.getAvailability())
                .collect(Collectors.toList());
        System.out.println("[DEBUG] Available workers: " + workers.size());

        // Filter by job title if provided (case-insensitive)
        if (request.getJobTitle() != null && !request.getJobTitle().isBlank()) {
            System.out.println("[DEBUG] Filtering by jobTitle: " + request.getJobTitle());
            workers = workers.stream()
                    .filter(w -> w.getJobRole() != null &&
                            w.getJobRole().toLowerCase().contains(request.getJobTitle().toLowerCase()))
                    .collect(Collectors.toList());
            System.out.println("[DEBUG] Workers after jobTitle filter: " + workers.size());
        }

        // Filter by name if provided (case-insensitive)
        if (request.getName() != null && !request.getName().isBlank()) {
            System.out.println("[DEBUG] Filtering by name: " + request.getName());
            workers = workers.stream()
                    .filter(w -> w.getUser() != null && w.getUser().getFullName() != null &&
                            w.getUser().getFullName().toLowerCase().contains(request.getName().toLowerCase()))
                    .collect(Collectors.toList());
            System.out.println("[DEBUG] Workers after name filter: " + workers.size());
        }

        // Filter by user code if provided
        if (request.getUserCode() != null && !request.getUserCode().isBlank()) {
            System.out.println("[DEBUG] Filtering by userCode: " + request.getUserCode());
            workers = workers.stream()
                    .filter(w -> w.getUser() != null && w.getUser().getUniqueUserCode() != null &&
                            w.getUser().getUniqueUserCode().equals(request.getUserCode()))
                    .collect(Collectors.toList());
            System.out.println("[DEBUG] Workers after userCode filter: " + workers.size());
        }

        // ONLY filter by time slot if BOTH start and end times are provided
        if (request.getStartDateTime() != null && request.getEndDateTime() != null) {
            System.out.println("[DEBUG] Filtering by availability slot: " + request.getStartDateTime() + " to "
                    + request.getEndDateTime());
            workers = workers.stream()
                    .filter(w -> !bookingRepo.existsConfirmedOverlap(w.getId(),
                            request.getStartDateTime(), request.getEndDateTime()))
                    .collect(Collectors.toList());
            System.out.println("[DEBUG] Workers after time slot filter: " + workers.size());
        }

        System.out.println("[DEBUG] Final workers returned: " + workers.size());

        // Convert to DTOs
        List<WorkerDTO> dtos = workers.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        // Debug: Print DTO details
        dtos.forEach(dto -> {
            System.out.println("[DEBUG] DTO: id=" + dto.getId() + ", jobRole=" + dto.getJobRole());
            if (dto.getUser() != null) {
                System.out.println("[DEBUG]   User: id=" + dto.getUser().getId() +
                        ", name=" + dto.getUser().getFullName() +
                        ", code=" + dto.getUser().getUniqueUserCode());
            } else {
                System.out.println("[DEBUG]   User: NULL");
            }
        });

        return dtos;
    }

    public List<WorkerDTO> convertToDTOs(List<WorkerProfile> workers) {
        return workers.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private WorkerDTO toDTO(WorkerProfile worker) {
        WorkerDTO.UserDTO userDTO = null;
        if (worker.getUser() != null) {
            userDTO = WorkerDTO.UserDTO.builder()
                    .id(worker.getUser().getId())
                    .uniqueUserCode(worker.getUser().getUniqueUserCode())
                    .fullName(worker.getUser().getFullName())
                    .jobTitle(worker.getUser().getJobTitle())
                    .email(worker.getUser().getEmail())
                    .phone(worker.getUser().getPhone())
                    .address(worker.getUser().getAddress())
                    .profileImagePath(worker.getUser().getProfileImagePath())
                    .cvPath(worker.getUser().getCvPath())
                    .portfolioLink(worker.getUser().getPortfolioLink())
                    .linkedinLink(worker.getUser().getLinkedinLink())
                    .build();
        }

        return WorkerDTO.builder()
                .id(worker.getId())
                .subtype(worker.getSubtype())
                .jobRole(worker.getJobRole())
                .yearsExperience(worker.getYearsExperience())
                .bio(worker.getBio())
                .workType(worker.getWorkType())
                .coverageRadiusKm(worker.getCoverageRadiusKm())
                .pricingType(worker.getPricingType())
                .rate(worker.getRate())
                .paymentUpi(worker.getPaymentUpi())
                .paymentBankAcc(worker.getPaymentBankAcc())
                .paymentIfsc(worker.getPaymentIfsc())
                .availability(worker.getAvailability())
                .verified(worker.getVerified())
                .skills(worker.getSkills())
                .workCategories(worker.getWorkCategories())
                .user(userDTO)
                .build();
    }
}