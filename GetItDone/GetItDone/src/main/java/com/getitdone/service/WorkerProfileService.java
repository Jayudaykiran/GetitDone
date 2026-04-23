package com.getitdone.service;

import com.getitdone.dto.WorkerProfileRequest;
import com.getitdone.model.User;
import com.getitdone.model.WorkerProfile;
import com.getitdone.repository.UserRepository;
import com.getitdone.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class WorkerProfileService {
    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;

    public WorkerProfileService(WorkerProfileRepository workerProfileRepository, UserRepository userRepository) {
        this.workerProfileRepository = workerProfileRepository;
        this.userRepository = userRepository;
    }

    public WorkerProfile createOrUpdateProfile(UUID userId, WorkerProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Optional<WorkerProfile> existing = workerProfileRepository.findByUser(user);
        WorkerProfile profile = existing.orElse(new WorkerProfile());
        profile.setUser(user);
        profile.setSubtype(req.getSubtype());
        profile.setJobRole(req.getJobRole());
        profile.setYearsExperience(req.getYearsExperience());
        profile.setBio(req.getBio());
        profile.setWorkType(req.getWorkType());
        profile.setCoverageRadiusKm(req.getCoverageRadiusKm());
        profile.setPricingType(req.getPricingType());
        profile.setRate(req.getRate());
        profile.setPaymentUpi(req.getPaymentUpi());
        profile.setPaymentBankAcc(req.getPaymentBankAcc());
        profile.setPaymentIfsc(req.getPaymentIfsc());
        profile.setAvailability(true);
        profile.setVerified(false);
        return workerProfileRepository.save(profile);
    }

    public List<WorkerProfile> search(String jobRole) {
        if (jobRole == null || jobRole.isBlank()) {
            return workerProfileRepository.findByAvailabilityTrue();
        }
        return workerProfileRepository.findByJobRoleContainingIgnoreCaseAndAvailabilityTrue(jobRole);
    }

    public Optional<WorkerProfile> getById(UUID id) {
        return workerProfileRepository.findById(id);
    }
}
