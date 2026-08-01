# 🛡️ VisiPass - Smart Campus Visitor Management & Gate Access Control System

> **Hackathon Submission Project** | A full-stack, role-isolated campus visitor gate pass authorization, real-time webcam scanning, 6-digit OTP verification, and automated audit logging platform.

---

## 🌟 Executive Summary (What the Project Does)

**VisiPass** eliminates manual paper gate registers by providing a seamless, automated digital gate pass solution for educational campuses and corporate facilities. 

### 👥 Key User Roles & Capabilities:

1. **📱 Visitor & Student Portal**:
   * **Visit Registration**: Submit requests with 10-digit phone validation, student name, department, visit date, time window, and purpose.
   * **Digital Pass**: View approved passes with ultra-crisp low-density (21x21 grid) QR codes and a **6-Digit Gate OTP PIN** (`241280`).
   * **Instant PDF Download**: Generate and download official single-page **White-Theme A4 Gate Pass PDFs** (`Visitor_Gate_Pass_REQ-8492.pdf`) in under 10 milliseconds.

2. **⚙️ System Administration Portal**:
   * **Real-time Analytics**: Dynamic count cards tracking Total, Pending, Approved, and Rejected requests.
   * **Approval & Rejection Control**: Admin reviews visitor submissions and approves passes (automatically generating a 6-digit gate OTP) or denies entry.
   * **Gate Audit Logs**: Monitor real-time campus entry/exit activity and active visit durations.

3. **👮 Security Gate Control Portal**:
   * **30 FPS Camera Viewfinder**: Real-time webcam hardware QR scanner with purple laser scanning beam animations and single L-bracket targeting.
   * **OTP Gate Verification**: Keypad input to verify 6-digit OTPs if a visitor's mobile phone screen is unavailable.
   * **Check-In / Check-Out Tracking**: Record visitor arrival and departure times with live active duration metrics (`X mins (Active)`).

4. **🔔 Role-Isolated Notification Engine**:
   * Targeted alerts dispatched specifically to Visitors, Admins, or Security Officers with individual `(X)` close buttons for instant dismissal.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TailwindCSS v4, Lucide Icons, `qrcode.react`, `html5-qrcode`, `jsPDF`.
- **Backend**: Node.js, Express.js REST API (`http://localhost:5000`).
- **Database**: MongoDB & Mongoose ODM (`users`, `visitorrequests`, `gatelogs`).
- **Build Tool**: Vite (883ms production build time).

---

## 🔑 Demo Credentials for Judges

| Role | Email | Password | Dashboard View |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `admin123` | Administration & Audit Portal |
| **Security Officer** | `officer@campus.edu` | `sec123` | Security Gate & Camera Scanner |
| **Visitor / Student** | `visitor@example.com` | `pass123` | Visit Request & Digital Pass |

---

## 🚀 Quick Setup & Installation

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend server will run on `http://localhost:5000` with MongoDB initialization.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend app will run on `http://localhost:5173`.*

---

## 📡 API Endpoint Overview

- `POST /api/auth/login` - Authenticate user & return DB role
- `GET /api/requests` - Retrieve visitor requests (filtered by role/email)
- `POST /api/requests` - Submit new visitor registration request
- `PATCH /api/requests/:id/approve` - Approve request & generate 6-digit OTP PIN
- `PATCH /api/requests/:id/reject` - Reject visitor request
- `POST /api/requests/:id/check-in` - Record security gate arrival
- `POST /api/requests/:id/check-out` - Record gate departure & calculate visit duration
