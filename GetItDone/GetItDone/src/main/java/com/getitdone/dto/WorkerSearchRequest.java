package com.getitdone.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkerSearchRequest {
    private String jobTitle; // Search by job title
    private String name; // Search by worker name
    private String userCode; // Search by unique user code
    private LocalDateTime startDateTime; // Time slot to check availability
    private LocalDateTime endDateTime;

    @Override
    public String toString() {
        return "WorkerSearchRequest{" +
                "jobTitle='" + jobTitle + '\'' +
                ", name='" + name + '\'' +
                ", userCode='" + userCode + '\'' +
                ", startDateTime=" + startDateTime +
                ", endDateTime=" + endDateTime +
                '}';
    }
}