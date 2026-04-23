package com.getitdone.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "calendar_blocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarBlock {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile worker;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    @Column(columnDefinition = "text")
    private String reason;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
        createdAt = LocalDateTime.now();
    }
}
