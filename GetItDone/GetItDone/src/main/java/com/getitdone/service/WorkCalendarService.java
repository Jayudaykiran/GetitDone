package com.getitdone.service;

import com.getitdone.model.CalendarBlock;
import com.getitdone.model.WorkerProfile;
import com.getitdone.repository.WorkCalendarRepository;
import com.getitdone.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class WorkCalendarService {
    private final WorkCalendarRepository calendarRepository;
    private final WorkerProfileRepository workerProfileRepository;

    public WorkCalendarService(WorkCalendarRepository calendarRepository,
            WorkerProfileRepository workerProfileRepository) {
        this.calendarRepository = calendarRepository;
        this.workerProfileRepository = workerProfileRepository;
    }

    public List<CalendarBlock> getBookedSlots(UUID workerId) {
        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new IllegalArgumentException("Worker not found"));
        return calendarRepository.findByWorker(worker);
    }

    public List<CalendarBlock> getBookedSlotsBetween(UUID workerId, LocalDateTime start, LocalDateTime end) {
        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new IllegalArgumentException("Worker not found"));
        return calendarRepository.findByWorkerAndStartDateTimeBetween(worker, start, end);
    }
}
