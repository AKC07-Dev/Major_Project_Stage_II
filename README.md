<<<<<<< HEAD
# Major_Project_Stage_II
IoT-Based Smart Medicine Box for Scheduled Medication Assistance and Access Monitoring
=======
# SMART MEDICINE BOX — Commercial IoT Medication Adherence & Caretaker Monitoring Platform

An enterprise-grade IoT platform connecting physical ESP32 medication boxes with a modern dark glassmorphic Next.js web dashboard and Node.js TypeScript REST API.

---

## 🌟 Key Platform Features

- **Hardware Sensor Logic Isolation**:
  - **Box 1 (GPIO 13)**: Lid/light digital IR sensor (`CLOSED = 0`, `OPEN = 1`). Dose taken on `0 → 1` transition.
  - **Box 2 (GPIO 4)**: Proximity hand sensor (`NORMAL = 1`, `HAND = 0`). Dose taken on `1 → 0 → 1` complete hand movement.
  - **0.96" SSD1306 OLED (I2C 21/22)**: Preserved OLED screens (Welcome, Reminder, Taken, Missed, Idle).
- **Dynamic Backend Schedule Synchronization**:
  - ESP32 periodically polls schedule arrays over HTTP REST API (`GET /api/device/schedules`).
  - Offline-first resilience: Uses local cached schedules if Wi-Fi or server is temporarily unreachable.
- **Caretaker Web Platform**:
  - Dark glassmorphic healthcare design with violet & cyan glowing accents.
  - **Real-Time Dashboard**: Key KPI stat cards, prominent "MEDICINE DUE NOW" card, 7-day adherence charts, and live event log.
  - **Schedule & Prescription Management**: Interactive CRUD with time overlap & box conflict warnings.
  - **Medication History**: Filterable log table by date range, box, and intake status.
  - **Telemetry & Hardware Monitor**: Live Wi-Fi RSSI signal meter, firmware version, and pin state stream.
  - **Instant Notifications**: Automated Telegram caretaker messages for taken and missed doses.

---

## 🏗️ System Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                  CARETAKER WEB DASHBOARD                    │
 │ Next.js 14 + React + TypeScript + Tailwind CSS + Recharts  │
 └──────────────────────────────┬──────────────────────────────┘
                                │ REST API (HTTP / JSON)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                       BACKEND API                           │
 │ Node.js + Express + TypeScript + Prisma ORM                 │
 │ Auth, Schedules Engine, Event Ingestion, Analytics          │
 └──────────────┬──────────────────────────────┬───────────────┘
                │                              │
                ▼                              ▼
 ┌─────────────────────────────┐  ┌────────────────────────────┐
 │         DATABASE            │  │       ESP32 DEV KIT        │
 │ SQLite (Dev) / PostgreSQL   │  │ HTTP REST Client           │
 │ Users, Schedules, Events    │  │ OLED, Telegram, Sensors    │
 └─────────────────────────────┘  └────────────────────────────┘
```

---

## ⚡ Quick Start Guide (Local Development)

### 1. Prerequisites
- Node.js v18+ and npm installed.
- Arduino IDE (for ESP32 flashing).

### 2. Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:db:push
npm run seed
npm run dev
```
> The Express API will start on `http://localhost:5000`. Seed data creates default Caretaker (`caretaker@smartbox.com` / `caretaker123`) and 3 medication schedules.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:3000` in your web browser.

---

## 🔌 ESP32 Hardware Pinout

| Component | ESP32 Pin | Logic State / Notes |
| :--- | :--- | :--- |
| **Box 1 Sensor** | GPIO 13 | Closed = 0, Open = 1. Trigger = 0 → 1 |
| **Box 2 Sensor** | GPIO 4 | Normal = 1, Hand = 0. Trigger = 1 → 0 → 1 |
| **OLED SDA** | GPIO 21 | I2C Data (SSD1306 128x64 0x3C) |
| **OLED SCL** | GPIO 22 | I2C Clock |

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Caretaker authentication | None |
| `GET` | `/api/schedules` | Fetch medication schedules | Bearer JWT |
| `POST` | `/api/schedules` | Create new schedule | Bearer JWT |
| `GET` | `/api/device/schedules` | ESP32 schedule fetch | `X-Device-API-Key` |
| `POST` | `/api/device/events` | ESP32 event push | `X-Device-API-Key` |
| `POST` | `/api/device/heartbeat` | ESP32 telemetry ping | `X-Device-API-Key` |
| `GET` | `/api/analytics/summary` | Dashboard KPI summary | Bearer JWT |

---

## 📜 License & Acknowledgments

Built for Smart Medicine Box IoT Medication Adherence & Caretaker Monitoring Platform.
>>>>>>> 78e106f4 (Initial commit)
