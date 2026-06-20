# SmartCampus — Centralized Resource and Lab Booking Portal

A full-stack campus management system built with **React + Vite + Material UI** (frontend) and **Spring Boot** (backend), backed by **MySQL**, with **JWT + OTP Email** authentication.

---

## Project Structure

```
smartcampus/
├── frontend/                  # React + Vite + MUI
│   ├── src/
│   │   ├── api/               # Axios API layer
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context (Auth)
│   │   ├── pages/             # Route-level pages
│   │   └── utils/             # Utility helpers
│   ├── package.json
│   └── vite.config.js
├── backend/                   # Spring Boot
│   ├── src/main/java/com/smartcampus/
│   │   ├── config/            # Security, CORS
│   │   ├── controller/        # REST endpoints
│   │   ├── dto/               # Request / Response DTOs
│   │   ├── exception/         # Global error handling
│   │   ├── filter/            # JWT filter
│   │   ├── model/             # JPA entities
│   │   ├── repository/        # Spring Data JPA
│   │   └── service/           # Business logic
│   └── src/main/resources/
│       └── application.properties
└── database/
    └── init.sql
```

---

## Modules

| # | Module | Status |
|---|--------|--------|
| 1 | Authentication (Register · OTP · Login · JWT) | ✅ Complete |
| 2 | Resource Management | 🔜 Pending |
| 3 | Booking System | 🔜 Pending |
| 4 | Approval Workflows | 🔜 Pending |
| 5 | Timetable Management | 🔜 Pending |
| 6 | Admin Panel | 🔜 Pending |

---

## Roles

| Role | Permissions |
|------|-------------|
| **Student** | Register with register number · Book resources (3 days in advance) |
| **Faculty** | Higher priority bookings · Request resources |
| **HOD** | Approve department resources · Manage timetables & maintenance |
| **Admin** | Full control — users, departments, resources, approvals |

---

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.9+

### 1. Database

```sql
-- Run database/init.sql
mysql -u root -p < database/init.sql
```

### 2. Backend

```bash
cd backend
# Edit src/main/resources/application.properties:
#   spring.datasource.password=YOUR_MYSQL_PASSWORD
#   spring.mail.username=YOUR_GMAIL
#   spring.mail.password=YOUR_APP_PASSWORD

mvn spring-boot:run
# Starts on http://localhost:8080/api
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:5173
```

---

## API Endpoints — Authentication

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | Public | Register new Student / Faculty |
| POST | `/api/auth/verify-otp` | Public | Verify OTP and activate account |
| POST | `/api/auth/resend-otp` | Public | Resend OTP (60 s cooldown) |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Bearer | Get authenticated user profile |

---

## Default Admin Credentials

```
Email:    admin@smartcampus.edu
Password: Admin@1234
```

> ⚠️ Change the default admin password immediately after first login.

---

## Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account  
2. Go to **Google Account → Security → App Passwords**  
3. Create an App Password for "Mail"  
4. Use the generated 16-character password in `application.properties`

---

## Environment Variables

### Backend (`application.properties`)
| Key | Description |
|-----|-------------|
| `spring.datasource.password` | MySQL root password |
| `spring.mail.username` | Gmail address |
| `spring.mail.password` | Gmail app password |
| `app.jwt.secret` | Base64-encoded JWT secret (min 256-bit) |
| `app.frontend-url` | Frontend origin for CORS |

### Frontend (`.env`)
| Key | Description |
|-----|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
