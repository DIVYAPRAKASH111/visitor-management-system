# 🛡️ Visitor Management System (VMS) — Comprehensive Project Documentation

---

## 📌 1. Project Overview

The **Visitor Management System (VMS)** is an enterprise-grade, full-stack web application designed for campus visitor tracking, automated pass generation, security gate access control, and administrative audit logging. 

Built with **React, Vite, Node.js, Express, and MongoDB**, VMS replaces legacy paper visitor logbooks with digital QR-coded passes, automated multi-admin workflow routing, and real-time security gate verification.

---

## 🚀 2. System Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │          React + Vite Frontend           │
                     │  (TailwindCSS, Lucide-React, jsPDF, etc) │
                     └────────────────────┬─────────────────────┘
                                          │  HTTP / REST API
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │          Node.js + Express Server        │
                     │        (Hybrid Memory / Mongo Engine)    │
                     └────────────────────┬─────────────────────┘
                                          │  Mongoose ORM
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │           MongoDB Database               │
                     │    (Users, VisitorRequests, GateLogs)   │
                     └──────────────────────────────────────────┘
```

| Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite | High-performance SPA with modern dark-mode aesthetic |
| **Styling** | Vanilla CSS, TailwindCSS | Glassmorphism card effects, responsive tables, interactive badges |
| **PDF Engine** | `jsPDF` | Instant single-page vector A4 PDF gate pass generator |
| **Backend API** | Node.js, Express.js | Modular REST endpoints with hybrid cloud/memory fallback |
| **Database** | MongoDB, Mongoose | Schema-validated persistent storage for users and gate logs |
| **Icons** | `lucide-react` | Clean icon system for real-time status indicators |

---

## 👥 3. Role-Based Access Control (RBAC) & Accounts

The system supports **3 Primary User Roles**:

### 1️⃣ Visitor (Public Registrations)
- **Public Access**: Visitors can register accounts or sign in via **Google Sign-In**.
- **Capabilities**: Submit visit requests, view pass approval status, download single-page A4 PDF passes with 6-digit OTP & QR codes.

### 2️⃣ System Administrators (Pre-Loaded Accounts)
VMS features an automated **Visitor Request Assignment Algorithm** based on request submission sequence:

| Admin Name | Email | Password | Assigned Visitor Requests |
| :--- | :--- | :--- | :--- |
| **Prakash** | `admin1@gmail.com` | `admin123` | **Requests #1 to #20** |
| **Gobi** | `admin2@gmail.com` | `admin456` | **Requests #21 to #40** |
| **Abhi** | `admin3@gmail.com` | `admin789` | **Requests #41+** |
| **Alex Johnson** | `admin@campus.edu` | `admin123` | **System Master Overview** (All Requests) |

- **Capabilities**: Approve/reject visit requests, review entry/exit audit logs, evaluate pass validity status (Active vs. Expired).

### 3️⃣ Security Staff (Pre-Loaded Accounts)
Security officers have full campus-wide access to scan, verify, and log arrivals across all campus gates:

| Security Name | Email | Password | Assigned Gate Location |
| :--- | :--- | :--- | :--- |
| **Ram** | `security1@gmail.com` | `security123` | Gate 1 / Main Entrance |
| **Dobby** | `security2@gmail.com` | `security456` | Gate 2 / North Entrance |
| **Jap** | `security3@gmail.com` | `security789` | Gate 3 / South Entrance |
| **Officer Marcus Vance**| `officer@campus.edu` | `sec123` | Gate 1 / Control Room |

- **Capabilities**: Scan QR pass codes, enter 6-digit OTP PINs, perform Check-In and Check-Out, view real-time gate activity.

---

## ⚡ 4. Core Features & Workflows

### 📝 Visitor Request Submission & Auto-Routing
1. Visitor fills out the registration form (Name, Email, 10-digit Phone, Host Student/Faculty Name, Register No, Department, Date, Time Slot, Purpose).
2. Request is assigned automatically to Admin 1 (Reqs 1-20), Admin 2 (Reqs 21-40), or Admin 3 (Reqs 41+).
3. Targeted real-time notifications are sent to the assigned Admin and Visitor.

### 🛡️ Admin Approval & OTP PIN Generation
1. Assigned Admin reviews request on the **Admin Portal**.
2. Click **Approve** ➔ System generates a 6-digit OTP PIN (e.g. `472839`) and updates status to `Approved`.
3. Visitor receives instant notification and access to their digital pass.

### 📄 Pure Vector Single-Page PDF Pass Generator
- Generates a **100% white theme, single A4 page PDF** using native `jsPDF` line drawing routines.
- Includes Visitor Name, Host/Student Name, Register No, Department, Date & Time, Purpose, 6-digit OTP PIN, and embedded QR Verification block.

### 🚪 Security Gate Scanning & Check-In / Check-Out
1. Security officer scans QR code or enters 6-digit OTP PIN / Request ID.
2. Click **Check-In** ➔ Timestamp and Officer Name are saved; status changes to `Checked-In`.
3. Click **Check-Out** ➔ Timestamp is saved; status changes to `Checked-Out` and visit duration is calculated in minutes.
4. Admin Dashboard updates in real-time.

---

## 📡 5. API Endpoints Reference

| HTTP Method | Endpoint | Description | Query / Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates user & returns role | `{ email, password }` |
| `POST` | `/api/auth/register` | Registers visitor account (Visitor role only) | `{ name, email, password }` |
| `POST` | `/api/auth/google` | Google sign-in password-free lookup | `{ email, name }` |
| `GET` | `/api/requests` | Fetch requests (Filtered by role & email) | `?role=admin&email=admin1@gmail.com` |
| `POST` | `/api/requests` | Submit new visit request | `{ visitorName, email, phone, ... }` |
| `PATCH` | `/api/requests/:id/approve` | Approve request & assign 6-digit PIN | `{ timestamp, passPin }` |
| `PATCH` | `/api/requests/:id/reject` | Reject visit request | N/A |
| `POST` | `/api/requests/:id/check-in` | Security gate check-in | `{ officerName }` |
| `POST` | `/api/requests/:id/check-out` | Security gate check-out | `{ officerName }` |
| `GET` | `/api/requests/verify/:id` | Real-time QR / OTP verification lookup | `:id` (Request ID or PIN) |

---

## 🗄️ 6. Database Models (MongoDB / Mongoose)

### `User` Model Schema
```javascript
{
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'security', 'visitor'], default: 'visitor' },
  title: String,
  gate: String,
  avatar: String
}
```

### `VisitorRequest` Model Schema
```javascript
{
  id: { type: String, required: true, unique: true },
  visitorName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  host: String,
  studentName: String,
  studentRegisterNo: String,
  hostDepartment: String,
  date: String,
  time: String,
  startTime: String,
  endTime: String,
  purpose: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Checked-In', 'Checked-Out'] },
  approvedBy: String,
  approvedAt: String,
  passPin: String,
  checkInTime: String,
  checkedInBy: String,
  checkOutTime: String,
  checkedOutBy: String,
  durationMinutes: Number,
  assignedAdminEmail: String,
  assignedAdminName: String,
  submittedAt: String
}
```

---

## 🌐 7. Local Setup & Production Cloud Deployment

### Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/DIVYAPRAKASH111/visitor-management-system.git
cd visitor-management-system

# 2. Start Backend API Server (Port 5000)
cd backend
npm install
npm start

# 3. In a new terminal, start Frontend Dev Server (Port 5173)
cd frontend
npm install
npm run dev
```

### Production Cloud Deployment

#### **Frontend Deployment (Vercel)**:
1. Go to [Vercel.com](https://vercel.com) ➔ Import repository `visitor-management-system`.
2. Framework Preset: **Vite** | Root Directory: **`frontend`**.
3. Environment Variable: `VITE_API_BASE_URL` = Your backend Render URL.
4. Click **Deploy**.

#### **Backend Deployment (Render)**:
1. Go to [Render.com](https://render.com) ➔ Create **New Web Service**.
2. Root Directory: **`backend`** | Build Command: `npm install` | Start Command: `npm start`.
3. Environment Variable: `MONGODB_URI` = Your MongoDB Atlas Connection URL.
4. Click **Create Web Service**.

---

## 🏆 Hackathon Demo Credentials Quick Reference

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin 1 (Prakash)** | `admin1@gmail.com` | `admin123` | Visitor Requests **#1–20** |
| **Admin 2 (Gobi)** | `admin2@gmail.com` | `admin456` | Visitor Requests **#21–40** |
| **Admin 3 (Abhi)** | `admin3@gmail.com` | `admin789` | Visitor Requests **#41+** |
| **Main Admin** | `admin@campus.edu` | `admin123` | All Requests Master View |
| **Security 1 (Ram)** | `security1@gmail.com` | `security123` | Gate 1 Gate Activity & OTP Scan |
| **Security 2 (Dobby)** | `security2@gmail.com` | `security456` | Gate 2 Gate Activity & OTP Scan |
| **Security 3 (Jap)** | `security3@gmail.com` | `security789` | Gate 3 Gate Activity & OTP Scan |
| **Visitor** | `visitor@example.com` | `visitor123` | Personal Pass View & PDF Download |
