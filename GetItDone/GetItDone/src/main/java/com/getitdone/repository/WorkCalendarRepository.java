package com.getitdone.repository;

import com.getitdone.model.CalendarBlock;
import com.getitdone.model.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkCalendarRepository extends JpaRepository<CalendarBlock, UUID> {
    List<CalendarBlock> findByWorkerAndStartDateTimeBetween(WorkerProfile worker, LocalDateTime start,
            LocalDateTime end);

    List<CalendarBlock> findByWorker(WorkerProfile worker);
}
