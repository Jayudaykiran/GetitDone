package com.getitdone.controller;

import com.getitdone.dto.WorkerDTO;
import com.getitdone.dto.WorkerSearchRequest;
import com.getitdone.model.WorkerProfile;
import com.getitdone.repository.WorkerProfileRepository;
import com.getitdone.service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {
    private final WorkerProfileRepository repo;
    private final com.getitdone.repository.UserRepository userRepo;
    private final WorkerService workerService;

    public WorkerController(WorkerProfileRepository repo,
            com.getitdone.repository.UserRepository userRepo,
            WorkerService workerService) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.workerService = workerService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchWorkersGet(
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String userCode,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        try {
            System.out.println("[WorkerController] GET /api/workers/search called");
            System.out.println("[WorkerController] Params - jobTitle: " + jobTitle + ", name: " + name + ", userCode: "
                    + userCode);

            WorkerSearchRequest request = new WorkerSearchRequest();
            request.setJobTitle(jobTitle);
            request.setName(name);
            request.setUserCode(userCode);

            // Parse date and time if provided
            if (date != null && startTime != null && endTime != null) {
                try {
                    request.setStartDateTime(java.time.LocalDateTime.parse(date + "T" + startTime));
                    request.setEndDateTime(java.time.LocalDateTime.parse(date + "T" + endTime));
                } catch (Exception e) {
                    System.err.println("[WorkerController] Error parsing date/time: " + e.getMessage());
                }
            }

            System.out.println("[WorkerController] Request: " + request);
            List<WorkerDTO> workers = workerService.searchAvailableWorkers(request);
            System.out.println("[WorkerController] Returning " + workers.size() + " workers");

            // Return structured response with count and workers array
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("count", workers.size());
            response.put("workers", workers);

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            System.err.println("[WorkerController] Error in searchWorkers: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.badRequest().body("Error searching workers: " + ex.getMessage());
        }
    }

    @PostMapping("/search")
    public ResponseEntity<?> searchWorkers(@RequestBody(required = false) WorkerSearchRequest request) {
        try {
            System.out.println("[WorkerController] POST /api/workers/search called");
            if (request == null) {
                System.out.println("[WorkerController] Request body is null, creating empty request");
                request = new WorkerSearchRequest();
            }
            System.out.println("[WorkerController] Request: " + request);

            List<WorkerDTO> workers = workerService.searchAvailableWorkers(request);
            System.out.println("[WorkerController] Returning " + workers.size() + " workers");

            return ResponseEntity.ok(workers);
        } catch (Exception ex) {
            System.err.println("[WorkerController] Error in searchWorkers: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.badRequest().body("Error searching workers: " + ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<WorkerDTO>> listAll(@RequestParam(value = "q", required = false) String q) {
        System.out.println("[WorkerController] GET /api/workers called with q=" + q);
        List<WorkerProfile> workers;
        if (q == null || q.isBlank()) {
            workers = repo.findAll();
        } else {
            workers = repo.findByJobRoleContainingIgnoreCase(q);
        }
        List<WorkerDTO> dtos = workerService.convertToDTOs(workers);
        System.out.println("[WorkerController] Returning " + dtos.size() + " workers");
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return repo.findById(id)
                .map(worker -> ResponseEntity.ok(workerService.convertToDTOs(List.of(worker)).get(0)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProfile(@RequestBody com.getitdone.dto.WorkerProfileRequest req,
            java.security.Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).body("Unauthorized");
        String email = principal.getName();
        var userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body("User not found");
        var user = userOpt.get();
        com.getitdone.model.WorkerProfile wp = com.getitdone.model.WorkerProfile.builder()
                .user(user)
                .subtype(req.getSubtype())
                .jobRole(req.getJobRole())
                .yearsExperience(req.getYearsExperience())
                .bio(req.getBio())
                .workType(req.getWorkType())
                .coverageRadiusKm(req.getCoverageRadiusKm())
                .pricingType(req.getPricingType())
                .rate(req.getRate())
                .paymentUpi(req.getPaymentUpi())
                .paymentBankAcc(req.getPaymentBankAcc())
                .paymentIfsc(req.getPaymentIfsc())
                .availability(true)
                .verified(false)
                .build();
        repo.save(wp);
        return ResponseEntity.ok(wp);
    }

    // Skill Management Endpoints
    @PostMapping("/{id}/skills")
    public ResponseEntity<?> addSkill(@PathVariable UUID id, @RequestBody java.util.Map<String, String> payload) {
        var wpOpt = repo.findById(id);
        if (wpOpt.isEmpty())
            return ResponseEntity.notFound().build();

        String skill = payload.get("skill");
        if (skill == null || skill.isBlank())
            return ResponseEntity.badRequest().body("Skill is required");

        var wp = wpOpt.get();
        if (wp.getSkills() == null)
            wp.setSkills(new java.util.ArrayList<>());
        if (!wp.getSkills().contains(skill)) {
            wp.getSkills().add(skill);
            repo.save(wp);
        }
        return ResponseEntity.ok(wp);
    }

    @DeleteMapping("/{id}/skills/{skill}")
    public ResponseEntity<?> removeSkill(@PathVariable UUID id, @PathVariable String skill) {
        var wpOpt = repo.findById(id);
        if (wpOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var wp = wpOpt.get();
        if (wp.getSkills() != null) {
            wp.getSkills().remove(skill);
            repo.save(wp);
        }
        return ResponseEntity.ok(wp);
    }

    // Category Management Endpoints
    @PostMapping("/{id}/categories")
    public ResponseEntity<?> addCategory(@PathVariable UUID id, @RequestBody java.util.Map<String, String> payload) {
        var wpOpt = repo.findById(id);
        if (wpOpt.isEmpty())
            return ResponseEntity.notFound().build();

        String category = payload.get("category");
        if (category == null || category.isBlank())
            return ResponseEntity.badRequest().body("Category is required");

        var wp = wpOpt.get();
        if (wp.getWorkCategories() == null)
            wp.setWorkCategories(new java.util.ArrayList<>());
        if (!wp.getWorkCategories().contains(category)) {
            wp.getWorkCategories().add(category);
            repo.save(wp);
        }
        return ResponseEntity.ok(wp);
    }

    @DeleteMapping("/{id}/categories/{category}")
    public ResponseEntity<?> removeCategory(@PathVariable UUID id, @PathVariable String category) {
        var wpOpt = repo.findById(id);
        if (wpOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var wp = wpOpt.get();
        if (wp.getWorkCategories() != null) {
            wp.getWorkCategories().remove(category);
            repo.save(wp);
        }
        return ResponseEntity.ok(wp);
    }

    // Update Worker Profile Endpoint
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable UUID id,
            @RequestBody com.getitdone.dto.WorkerProfileRequest req) {
        var wpOpt = repo.findById(id);
        if (wpOpt.isEmpty())
            return ResponseEntity.notFound().build();

        var wp = wpOpt.get();

        // Update fields only if provided
        if (req.getSubtype() != null)
            wp.setSubtype(req.getSubtype());
        if (req.getJobRole() != null)
            wp.setJobRole(req.getJobRole());
        if (req.getYearsExperience() != null)
            wp.setYearsExperience(req.getYearsExperience());
        if (req.getBio() != null)
            wp.setBio(req.getBio());
        if (req.getWorkType() != null)
            wp.setWorkType(req.getWorkType());
        if (req.getCoverageRadiusKm() != null)
            wp.setCoverageRadiusKm(req.getCoverageRadiusKm());
        if (req.getPricingType() != null)
            wp.setPricingType(req.getPricingType());
        if (req.getRate() != null)
            wp.setRate(req.getRate());
        if (req.getPaymentUpi() != null)
            wp.setPaymentUpi(req.getPaymentUpi());
        if (req.getPaymentBankAcc() != null)
            wp.setPaymentBankAcc(req.getPaymentBankAcc());
        if (req.getPaymentIfsc() != null)
            wp.setPaymentIfsc(req.getPaymentIfsc());

        repo.save(wp);
        return ResponseEntity.ok(wp);
    }
}
