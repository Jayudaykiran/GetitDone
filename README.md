# 🚀 GetItDone – Service Booking Platform

A full-stack web application that connects **clients** with **skilled workers** (both professional and everyday service providers) through a secure, structured, and transparent booking system.

---

## 📖 Overview

GetItDone is designed to solve real-world problems in service discovery and booking. Traditional methods rely on unverified sources and fragmented communication, leading to inefficiency and lack of trust.

This platform provides:
- Verified worker profiles
- Real-time availability tracking
- Structured booking workflows
- Secure authentication and data handling

---

## 🎯 Key Features

### 👤 User Management
- Secure registration & login (JWT-based authentication)
- Role-based access (Client / Worker)
- Aadhaar/PAN-based identity verification

### 🔍 Worker Discovery
- Search by:
  - Job role
  - Skills
  - Worker ID
  - Availability
- Filter and compare worker profiles

### 📅 Booking System
- Complete booking lifecycle:
  - Request → Accept/Reject → Complete/Cancel
- Real-time availability check
- Calendar-based scheduling
- Conflict prevention (no double booking)

### 🧑‍💼 Worker Dashboard
- Profile management
- Skills & experience updates
- Booking request handling
- Availability control

### 👨‍💻 Client Dashboard
- Search workers
- Book services
- Track booking status
- View history (completed/cancelled)

---

## 🏗️ System Architecture

The project follows a **multi-tier architecture**:

- **Frontend (Presentation Layer)**  
  React + TypeScript + Tailwind CSS

- **Backend (Application Layer)**  
  Spring Boot (MVC Architecture)

- **Database (Data Layer)**  
  PostgreSQL

---

## ⚙️ Tech Stack

### 🔹 Frontend
- React
- TypeScript
- Tailwind CSS
- Axios
- React Router

### 🔹 Backend
- Java 17
- Spring Boot
- Spring Security
- JWT Authentication
- Hibernate / JPA

### 🔹 Database
- PostgreSQL

---

## 🔐 Security Features
- Password encryption (BCrypt)
- JWT-based authentication
- Role-based authorization
- Protected API endpoints

---

## 📊 Core Modules

- Authentication & Authorization
- Worker Profile Management
- Search & Filtering System
- Booking Lifecycle Management
- Calendar & Availability System
- Dashboard Interfaces

---

## 📌 Future Enhancements

- 💳 Payment Integration
- ⭐ Ratings & Reviews
- 🔔 Real-time Notifications
- 💬 Chat System
- 📱 Mobile Application
