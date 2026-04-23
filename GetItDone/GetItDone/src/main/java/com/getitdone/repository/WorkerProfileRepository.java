package com.getitdone.repository;

import com.getitdone.model.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, UUID> {
    List<WorkerProfile> findByJobRoleContainingIgnoreCase(String jobRole);

    List<WorkerProfile> findByAvailabilityTrue();

    List<WorkerProfile> findByJobRoleContainingIgnoreCaseAndAvailabilityTrue(String jobRole);

    java.util.Optional<WorkerProfile> findByUser(com.getitdone.model.User user);

    // Additional search methods using IgnoreCaseContaining for case-insensitive
    // search
    @org.springframework.data.jpa.repository.Query("SELECT w FROM WorkerProfile w WHERE LOWER(w.jobRole) LIKE LOWER(CONCAT('%', :jobRole, '%'))")
    List<WorkerProfile> searchByJobRoleIgnoreCase(
            @org.springframework.data.repository.query.Param("jobRole") String jobRole);
}
