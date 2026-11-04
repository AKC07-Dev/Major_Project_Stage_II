/*
  ============================================================
  SMART MEDICINE BOX - ESP32 PRODUCTION FIRMWARE (REST SYNC)
  ============================================================

  Features:
  - Wi-Fi connection with auto-reconnect
  - Automatic time synchronization using NTP (Asia/Kolkata IST)
  - Dynamic Medication Schedules synchronized from Backend REST API
  - Offline-first resilience: Uses local cached schedules if Wi-Fi/Backend is down
  - OLED display (SSD1306 128x64 I2C)
  - Two compartment sensors with strict state machine logic:
      Box 1 (GPIO 13): Lid/light sensor. CLOSED = 0, OPEN = 1. Event: 0 -> 1
      Box 2 (GPIO 4) : Proximity/hand sensor. NORMAL = 1, HAND = 0. Event: 1 -> 0 -> 1
  - Telegram caretaker notification capability
  - Backend event push (MEDICINE_TAKEN, MEDICINE_MISSED)
  - Backend heartbeat reporting (Wi-Fi RSSI, Firmware version, Online status)
  - Hardware Test Mode toggle for simulation without physical sensors

  Hardware Pinout:
  - ESP32 DevKit
  - SSD1306 I2C OLED: SDA = GPIO 21, SCL = GPIO 22
  - Sensor Box 1: GPIO 13
  - Sensor Box 2: GPIO 4
*/

// ============================================================
// LIBRARIES
// ============================================================
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <time.h>

// Include configuration file if present, otherwise fallback to defaults
#if __has_include("config.h")
  #include "config.h"
#else
  // Default Configuration Placeholders
  const char* WIFI_SSID       = "Ghe";
  const char* WIFI_PASSWORD   = "saisakshi04";
  const char* BACKEND_HOST    = "http://192.168.1.100:5000";
  const char* DEVICE_ID       = "SMB-ESP32-001";
  const char* DEVICE_API_KEY  = "SMB-ESP32-SECRET-API-KEY-2026";
  const char* TELEGRAM_BOT_TOKEN = "7891313444:AAFum79at1DXgPpUzdLyhTb6WVZLGe1PeY8";
  const char* TELEGRAM_CHAT_ID   = "6444710224";
  #define HARDWARE_TEST_MODE 0
#endif

// ============================================================
// OLED CONFIGURATION
// ============================================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_SDA 21
#define OLED_SCL 22

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ============================================================
// SENSOR CONFIGURATION
// ============================================================
const int SENSOR_BOX_1_PIN = 13;
const int SENSOR_BOX_2_PIN = 4;

// Box 1: closed/dark = LOW (0), open/light = HIGH (1)
const int BOX1_CLOSED_RAW = LOW;
const int BOX1_OPEN_RAW   = HIGH;

// Box 2: normal = HIGH (1), hand = LOW (0)
const int BOX2_NORMAL_RAW = HIGH;
const int BOX2_HAND_RAW   = LOW;

// Require a state to remain stable before accepting it (500ms)
const unsigned long SENSOR_STABLE_MS = 500;

// ============================================================
// TIME CONFIGURATION (Asia/Kolkata IST GMT+5:30)
// ============================================================
const long GMT_OFFSET_SEC = 19800;
const int DAYLIGHT_OFFSET_SEC = 0;

// ============================================================
// MEDICATION SCHEDULE DATA STRUCTURE
// ============================================================
struct MedicineSchedule {
  String scheduleId;
  int startHour;
  int startMinute;
  int endHour;
  int endMinute;
  int boxNumber;
  String medicineName;

  bool reminderSent;
  bool completedToday;
  bool missedToday;
};

const int MAX_SCHEDULES = 10;
MedicineSchedule schedules[MAX_SCHEDULES] = {
  // Default initial fallback schedules
  {"sch_1", 8,  0, 9,  0, 1, "Morning Medicine",   false, false, false},
  {"sch_2", 13, 0, 14, 0, 2, "Afternoon Medicine", false, false, false},
  {"sch_3", 20, 0, 21, 0, 1, "Night Medicine",     false, false, false}
};

int numberOfSchedules = 3;

// ============================================================
// SYSTEM VARIABLES & STATE MACHINE
// ============================================================
int activeScheduleIndex = -1;
int lastDay = -1;

// Box 1 state tracking
int box1StableRaw = HIGH;
int box1CandidateRaw = HIGH;
unsigned long box1CandidateSince = 0;

// Box 2 state tracking
int box2StableRaw = HIGH;
int box2CandidateRaw = HIGH;
unsigned long box2CandidateSince = 0;

// Box 2 complete hand event latch: HIGH -> LOW -> HIGH
bool box2HandDetected = false;

// Polling Timers
unsigned long lastScheduleSyncTime = 0;
const unsigned long SCHEDULE_SYNC_INTERVAL = 30000; // 30 seconds

unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL = 15000;     // 15 seconds

// ============================================================
// DISPLAY FUNCTIONS
// ============================================================
void showMessage(const String& line1, const String& line2 = "", const String& line3 = "", const String& line4 = "") {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  display.setCursor(0, 0);  display.println(line1);
  if (line2.length() > 0) { display.setCursor(0, 16); display.println(line2); }
  if (line3.length() > 0) { display.setCursor(0, 32); display.println(line3); }
  if (line4.length() > 0) { display.setCursor(0, 48); display.println(line4); }
  display.display();
}

void showWelcomeScreen() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(8, 5);
  display.println("WELCOME");

  display.setTextSize(1);
  display.setCursor(20, 35);
  display.println("Smart Medicine");

  display.setCursor(38, 50);
  display.println("Box");

  display.display();
  delay(2500);
}

void showMedicineReminder(MedicineSchedule& medicine) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  display.setCursor(0, 0);
  display.println("MEDICINE REMINDER");

  display.setCursor(0, 16);
  display.println(medicine.medicineName);

  display.setCursor(0, 32);
  display.print("TAKE FROM BOX ");
  display.println(medicine.boxNumber);

  display.setCursor(0, 48);
  display.println("Please take medicine");

  display.display();
}

void showMedicineTaken(MedicineSchedule& medicine) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  display.setCursor(0, 0);
  display.println("MEDICINE TAKEN");

  display.setCursor(0, 18);
  display.println(medicine.medicineName);

  display.setCursor(0, 36);
  display.print("BOX ");
  display.print(medicine.boxNumber);
  display.println(" detected");

  display.setCursor(0, 52);
  display.println("Successfully recorded");

  display.display();
}

void showMedicineMissed(MedicineSchedule& medicine) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  display.setCursor(0, 0);
  display.println("MEDICINE MISSED");

  display.setCursor(0, 18);
  display.println(medicine.medicineName);

  display.setCursor(0, 36);
  display.print("BOX ");
  display.println(medicine.boxNumber);

  display.setCursor(0, 52);
  display.println("Dose not detected");

  display.display();
}

void showIdleScreen() {
  static unsigned long lastDisplayUpdate = 0;
  if (millis() - lastDisplayUpdate < 1000) return;
  lastDisplayUpdate = millis();

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return;

  char timeBuffer[10];
  strftime(timeBuffer, sizeof(timeBuffer), "%I:%M %p", &timeinfo);

  // If medicine is due, preserve reminder screen
  if (activeScheduleIndex >= 0 && activeScheduleIndex < numberOfSchedules) {
    MedicineSchedule& medicine = schedules[activeScheduleIndex];

    if (!medicine.completedToday && !medicine.missedToday) {
      display.clearDisplay();
      display.setTextColor(SSD1306_WHITE);

      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("MEDICINE DUE");

      display.setCursor(0, 14);
      display.println(medicine.medicineName);

      display.setTextSize(2);
      display.setCursor(0, 28);
      display.print("BOX ");
      display.println(medicine.boxNumber);

      display.setTextSize(1);
      display.setCursor(0, 52);
      display.println("Please take medicine");

      display.display();
      return;
    }
  }

  // Normal Idle Screen
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(12, 4);
  display.println(timeBuffer);

  display.setTextSize(1);
  display.setCursor(0, 32);
  display.println("Smart Medicine Box");

  display.setCursor(0, 48);
  if (WiFi.status() == WL_CONNECTED) {
    display.println("System: ONLINE");
  } else {
    display.println("System: OFFLINE");
  }

  display.display();
}

// ============================================================
// WIFI & TIME
// ============================================================
void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("\nConnecting to Wi-Fi...");
  showMessage("Connecting Wi-Fi...", "Please wait...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi connected!");
    Serial.print("IP: "); Serial.println(WiFi.localIP());
    showMessage("Wi-Fi Connected", WiFi.localIP().toString());
    delay(1000);
  } else {
    Serial.println("Wi-Fi connection failed. Operating in offline mode.");
    showMessage("Wi-Fi Offline", "Using Local Mode");
    delay(1500);
  }
}

void setupTime() {
  Serial.println("Synchronizing time...");
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, "pool.ntp.org", "time.nist.gov");

  struct tm timeinfo;
  int attempts = 0;
  while (!getLocalTime(&timeinfo) && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (getLocalTime(&timeinfo)) {
    Serial.println("Time synchronized.");
  } else {
    Serial.println("NTP time sync failed.");
  }
}

bool getCurrentTime(struct tm& timeinfo) {
  return getLocalTime(&timeinfo);
}

// ============================================================
// TELEGRAM NOTIFICATIONS
// ============================================================
String urlEncode(const String& text) {
  String encoded = "";
  for (int i = 0; i < text.length(); i++) {
    char c = text.charAt(i);
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || c == '-' || c == '_' || c == '.' || c == '~') {
      encoded += c;
    } else {
      char hex[4];
      sprintf(hex, "%%%02X", (unsigned char)c);
      encoded += hex;
    }
  }
  return encoded;
}

bool sendTelegramMessage(const String& message) {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  String url = "https://api.telegram.org/bot";
  url += TELEGRAM_BOT_TOKEN;
  url += "/sendMessage?chat_id=";
  url += TELEGRAM_CHAT_ID;
  url += "&text=";
  url += urlEncode(message);

  http.begin(client, url);
  int httpCode = http.GET();
  http.end();

  return (httpCode >= 200 && httpCode < 300);
}

// ============================================================
// BACKEND REST API COMMUNICATION
// ============================================================

void postEventToBackend(const String& scheduleId, const String& medicineName, int boxNumber, const String& eventType) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BACKEND_HOST) + "/api/device/events";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-API-Key", DEVICE_API_KEY);

  String payload = "{";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"scheduleId\":\"" + scheduleId + "\",";
  payload += "\"medicineName\":\"" + medicineName + "\",";
  payload += "\"boxNumber\":" + String(boxNumber) + ",";
  payload += "\"eventType\":\"" + eventType + "\"";
  payload += "}";

  int httpCode = http.POST(payload);
  Serial.print("[BACKEND PUSH] Event: "); Serial.print(eventType);
  Serial.print(" | HTTP Status: "); Serial.println(httpCode);
  http.end();
}

void sendHeartbeat() {
  if (millis() - lastHeartbeatTime < HEARTBEAT_INTERVAL) return;
  lastHeartbeatTime = millis();

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BACKEND_HOST) + "/api/device/heartbeat";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-API-Key", DEVICE_API_KEY);

  String payload = "{";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"wifiSignal\":" + String(WiFi.RSSI()) + ",";
  payload += "\"firmwareVersion\":\"v1.2.0\"";
  payload += "}";

  int httpCode = http.POST(payload);
  http.end();
}

void syncSchedulesFromBackend() {
  if (millis() - lastScheduleSyncTime < SCHEDULE_SYNC_INTERVAL && lastScheduleSyncTime != 0) return;
  lastScheduleSyncTime = millis();

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BACKEND_HOST) + "/api/device/schedules";
  http.begin(url);
  http.addHeader("X-Device-API-Key", DEVICE_API_KEY);

  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    Serial.println("[BACKEND SYNC] Schedules fetched successfully.");

    // Simple JSON schedule parser
    int countIdx = payload.indexOf("\"schedules\":[");
    if (countIdx != -1) {
      int parsedCount = 0;
      int searchPos = countIdx;

      while (parsedCount < MAX_SCHEDULES) {
        int objStart = payload.indexOf('{', searchPos);
        if (objStart == -1) break;
        int objEnd = payload.indexOf('}', objStart);
        if (objEnd == -1) break;

        String item = payload.substring(objStart, objEnd + 1);

        // Extract fields
        String schId = "";
        int startH = 0, startM = 0, endH = 0, endM = 0, boxN = 1;
        String medName = "Medication";

        int idPos = item.indexOf("\"id\":\"");
        if (idPos != -1) {
          int endPos = item.indexOf('"', idPos + 6);
          schId = item.substring(idPos + 6, endPos);
        }

        int sHPos = item.indexOf("\"startHour\":");
        if (sHPos != -1) startH = item.substring(sHPos + 12).toInt();

        int sMPos = item.indexOf("\"startMinute\":");
        if (sMPos != -1) startM = item.substring(sMPos + 14).toInt();

        int eHPos = item.indexOf("\"endHour\":");
        if (eHPos != -1) endH = item.substring(eHPos + 10).toInt();

        int eMPos = item.indexOf("\"endMinute\":");
        if (eMPos != -1) endM = item.substring(eMPos + 12).toInt();

        int bNPos = item.indexOf("\"boxNumber\":");
        if (bNPos != -1) boxN = item.substring(bNPos + 12).toInt();

        int mNPos = item.indexOf("\"medicineName\":\"");
        if (mNPos != -1) {
          int endPos = item.indexOf('"', mNPos + 16);
          medName = item.substring(mNPos + 16, endPos);
        }

        // Keep local daily state if schedule ID matches
        bool prevReminder = false, prevCompleted = false, prevMissed = false;
        for (int k = 0; k < numberOfSchedules; k++) {
          if (schedules[k].scheduleId == schId) {
            prevReminder = schedules[k].reminderSent;
            prevCompleted = schedules[k].completedToday;
            prevMissed = schedules[k].missedToday;
            break;
          }
        }

        schedules[parsedCount] = {schId, startH, startM, endH, endM, boxN, medName, prevReminder, prevCompleted, prevMissed};
        parsedCount++;
        searchPos = objEnd + 1;
      }

      if (parsedCount > 0) {
        numberOfSchedules = parsedCount;
      }
    }
  }
  http.end();
}

// ============================================================
// SENSOR DEBOUNCE
// ============================================================
bool updateStableSensor(int pin, int& stableRaw, int& candidateRaw, unsigned long& candidateSince) {
  int raw = digitalRead(pin);
  if (raw != candidateRaw) {
    candidateRaw = raw;
    candidateSince = millis();
  }
  if (candidateRaw != stableRaw && millis() - candidateSince >= SENSOR_STABLE_MS) {
    stableRaw = candidateRaw;
    return true;
  }
  return false;
}

// ============================================================
// MEDICINE EVENTS
// ============================================================
void medicineTakenSuccessfully(int scheduleIndex) {
  if (scheduleIndex < 0 || scheduleIndex >= numberOfSchedules) return;

  MedicineSchedule& medicine = schedules[scheduleIndex];
  if (medicine.completedToday) return;

  medicine.completedToday = true;

  Serial.println("\n================================");
  Serial.println("MEDICINE TAKEN");
  Serial.print("Medicine: "); Serial.println(medicine.medicineName);
  Serial.print("Box: "); Serial.println(medicine.boxNumber);

  showMedicineTaken(medicine);

  // Push to Backend & Telegram
  postEventToBackend(medicine.scheduleId, medicine.medicineName, medicine.boxNumber, "MEDICINE_TAKEN");

  struct tm timeinfo;
  String currentTime = "08:00 AM";
  if (getCurrentTime(timeinfo)) {
    char timeBuffer[20];
    strftime(timeBuffer, sizeof(timeBuffer), "%I:%M %p", &timeinfo);
    currentTime = String(timeBuffer);
  }

  String msg = "Medicine Taken Successfully\n\nMedicine: " + medicine.medicineName + "\nBox: " + String(medicine.boxNumber) + "\nTime: " + currentTime;
  sendTelegramMessage(msg);

  Serial.println("================================");
}

void medicineMissed(int scheduleIndex) {
  if (scheduleIndex < 0 || scheduleIndex >= numberOfSchedules) return;

  MedicineSchedule& medicine = schedules[scheduleIndex];
  if (medicine.completedToday || medicine.missedToday) return;

  medicine.missedToday = true;

  Serial.println("\n================================");
  Serial.println("MEDICINE MISSED");
  Serial.print("Medicine: "); Serial.println(medicine.medicineName);

  showMedicineMissed(medicine);

  // Push to Backend & Telegram
  postEventToBackend(medicine.scheduleId, medicine.medicineName, medicine.boxNumber, "MEDICINE_MISSED");

  String msg = "Medicine Missed Window\n\nMedicine: " + medicine.medicineName + "\nBox: " + String(medicine.boxNumber) + "\nStatus: Dose not detected within scheduled time.";
  sendTelegramMessage(msg);

  Serial.println("================================");
}

// ============================================================
// SCHEDULE HELPERS
// ============================================================
bool isMedicineWindowActive(MedicineSchedule& schedule, int currentHour, int currentMinute) {
  int currentTime = currentHour * 60 + currentMinute;
  int startTime   = schedule.startHour * 60 + schedule.startMinute;
  int endTime     = schedule.endHour * 60 + schedule.endMinute;
  return (currentTime >= startTime && currentTime < endTime);
}

void sendMedicineReminder(int scheduleIndex) {
  MedicineSchedule& medicine = schedules[scheduleIndex];
  medicine.reminderSent = true;

  showMedicineReminder(medicine);
  postEventToBackend(medicine.scheduleId, medicine.medicineName, medicine.boxNumber, "MEDICINE_REMINDER");

  String msg = "Medicine Reminder\n\nMedicine: " + medicine.medicineName + "\nBox: " + String(medicine.boxNumber) + "\nPlease take medicine now.";
  sendTelegramMessage(msg);
}

// ============================================================
// SENSOR DETECTION LOGIC
// ============================================================
bool updateBox2HandEvent() {
  if (box2StableRaw == BOX2_HAND_RAW) {
    box2HandDetected = true;
  }
  if (box2HandDetected && box2StableRaw == BOX2_NORMAL_RAW) {
    box2HandDetected = false;
    Serial.println("[EVENT] Box 2 hand movement detected (1 -> 0 -> 1).");
    return true;
  }
  return false;
}

void checkMedicineSensor() {
  updateStableSensor(SENSOR_BOX_1_PIN, box1StableRaw, box1CandidateRaw, box1CandidateSince);
  updateStableSensor(SENSOR_BOX_2_PIN, box2StableRaw, box2CandidateRaw, box2CandidateSince);

  if (activeScheduleIndex < 0 || activeScheduleIndex >= numberOfSchedules) {
    updateBox2HandEvent();
    return;
  }

  MedicineSchedule& medicine = schedules[activeScheduleIndex];
  if (medicine.completedToday || medicine.missedToday) return;

  struct tm timeinfo;
  if (!getCurrentTime(timeinfo)) return;

  if (!isMedicineWindowActive(medicine, timeinfo.tm_hour, timeinfo.tm_min)) return;

  bool correctBoxEvent = false;

  if (medicine.boxNumber == 1) {
    static bool box1WasClosed = true;
    if (box1StableRaw == BOX1_CLOSED_RAW) box1WasClosed = true;
    if (box1WasClosed && box1StableRaw == BOX1_OPEN_RAW) {
      correctBoxEvent = true;
      box1WasClosed = false;
      Serial.println("[EVENT] Box 1 lid opened (0 -> 1).");
    }
  } else if (medicine.boxNumber == 2) {
    correctBoxEvent = updateBox2HandEvent();
  }

  if (correctBoxEvent) {
    medicineTakenSuccessfully(activeScheduleIndex);
  }
}

void checkMedicationSchedule() {
  struct tm timeinfo;
  if (!getCurrentTime(timeinfo)) return;

  int currentHour   = timeinfo.tm_hour;
  int currentMinute = timeinfo.tm_min;
  int currentTime   = currentHour * 60 + currentMinute;

  int newActiveSchedule = -1;
  for (int i = 0; i < numberOfSchedules; i++) {
    MedicineSchedule& medicine = schedules[i];
    if (medicine.completedToday || medicine.missedToday) continue;

    if (isMedicineWindowActive(medicine, currentHour, currentMinute)) {
      newActiveSchedule = i;
      break;
    }
  }

  activeScheduleIndex = newActiveSchedule;

  for (int i = 0; i < numberOfSchedules; i++) {
    MedicineSchedule& medicine = schedules[i];
    if (medicine.completedToday || medicine.missedToday) continue;

    int startTime = medicine.startHour * 60 + medicine.startMinute;
    int endTime   = medicine.endHour * 60 + medicine.endMinute;

    if (currentTime >= startTime && currentTime < endTime && !medicine.reminderSent) {
      sendMedicineReminder(i);
    }

    if (currentTime >= endTime && !medicine.completedToday && !medicine.missedToday && medicine.reminderSent) {
      medicineMissed(i);
    }
  }
}

void resetDailySchedule() {
  struct tm timeinfo;
  if (!getCurrentTime(timeinfo)) return;

  if (lastDay == -1) {
    lastDay = timeinfo.tm_mday;
    return;
  }

  if (timeinfo.tm_mday != lastDay) {
    Serial.println("New day detected. Resetting daily schedules.");
    for (int i = 0; i < numberOfSchedules; i++) {
      schedules[i].reminderSent = false;
      schedules[i].completedToday = false;
      schedules[i].missedToday = false;
    }
    activeScheduleIndex = -1;
    box2HandDetected = false;
    lastDay = timeinfo.tm_mday;
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n================================");
  Serial.println("SMART MEDICINE BOX - ESP32 FIRMWARE");
  Serial.println("Starting system...");
  Serial.println("================================");

  pinMode(SENSOR_BOX_1_PIN, INPUT_PULLUP);
  pinMode(SENSOR_BOX_2_PIN, INPUT_PULLUP);

  box1StableRaw = digitalRead(SENSOR_BOX_1_PIN);
  box1CandidateRaw = box1StableRaw;
  box1CandidateSince = millis();

  box2StableRaw = digitalRead(SENSOR_BOX_2_PIN);
  box2CandidateRaw = box2StableRaw;
  box2CandidateSince = millis();

  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED initialization failed!");
    while (true) { delay(1000); }
  }

  showWelcomeScreen();
  connectToWiFi();

  if (WiFi.status() == WL_CONNECTED) {
    setupTime();
    syncSchedulesFromBackend();
    sendHeartbeat();
  }

  struct tm timeinfo;
  if (getCurrentTime(timeinfo)) {
    lastDay = timeinfo.tm_mday;
  }

  showMessage("System Ready", "Connected to Backend", "Waiting for schedule...");
  delay(1500);
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  resetDailySchedule();
  syncSchedulesFromBackend();
  sendHeartbeat();

  checkMedicationSchedule();
  checkMedicineSensor();

  showIdleScreen();
  delay(100);
}
