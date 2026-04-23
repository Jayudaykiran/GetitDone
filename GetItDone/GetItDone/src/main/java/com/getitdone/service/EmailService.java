package com.getitdone.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired(required = false)
    @Nullable
    private JavaMailSender mailSender;

    public void sendSimpleMessage(String to, String subject, String text) {
        if (mailSender == null) {
            // Mail not configured; skip per requirements (email reminders disabled for now)
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception ex) {
            System.err.println("Failed to send email to " + to + ": " + ex.getMessage());
        }
    }
}
