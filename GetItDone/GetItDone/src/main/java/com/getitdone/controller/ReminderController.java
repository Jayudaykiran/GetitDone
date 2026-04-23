package com.getitdone.controller;

import com.getitdone.service.ReminderService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ConditionalOnProperty(name = "features.reminders.enabled", havingValue = "true", matchIfMissing = false)
@RequestMapping("/api/reminders")
public class ReminderController {
    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendTestReminders() {
        reminderService.sendReminders();
        return ResponseEntity.ok("Reminders sent (test)");
    }
}
