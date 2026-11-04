# Smart Medicine Box Architecture Specification

## 1. Physical Hardware & Sensor State Machine Isolation

The Smart Medicine Box contains two distinct hardware compartments:

### Box 1 State Machine (GPIO 13)
- **Sensor**: Lid / Light IR Digital Sensor
- **Idle State**: CLOSED (`RAW 0`)
- **Active State**: OPEN (`RAW 1`)
- **Intake Event**: Triggered on positive edge transition (`0 → 1`).
- **Debounce Window**: 500ms candidate stability check (`SENSOR_STABLE_MS`).

### Box 2 State Machine (GPIO 4)
- **Sensor**: Proximity Hand Sensor
- **Idle State**: NORMAL (`RAW 1`)
- **Hand Presence**: HAND DETECTED (`RAW 0`)
- **Intake Event**: Latched full sequence transition (`1 → 0 → 1`).

---

## 2. Dynamic REST Sync & Offline Fallback

```
+------------------+         HTTP GET /api/device/schedules         +------------------+
|  ESP32 Firmware  | ---------------------------------------------> |  Backend REST    |
| (RAM Schedule    | <--------------------------------------------- |  API & Database  |
|  Buffer Array)   |        JSON Array [{startHour, ...}]           +------------------+
+------------------+
        |
        | (If Backend Unreachable)
        v
+------------------+
| Retain In-Memory |
| Cached Schedule  |
| Array Structs    |
+------------------+
```

---

## 3. Event Deduplication Engine

To prevent multiple rapid box triggers from creating redundant database records, the backend enforces a 60-second idempotency window per device ID, box number, and event type.

If a second identical event arrives within 60 seconds, the backend returns HTTP 200 with `{ message: "Duplicate event ignored (idempotent)" }` without creating duplicate records.
