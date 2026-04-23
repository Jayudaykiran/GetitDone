package com.getitdone.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type;
    private String title;
    @Column(columnDefinition = "text")
    private String body;

    private Boolean readFlag;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
        if (readFlag == null)
            readFlag = false;
        createdAt = LocalDateTime.now();
    }
}
