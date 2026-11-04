/*
  ============================================================
  SMART MEDICINE BOX - ESP32 CONFIGURATION TEMPLATE
  ============================================================
  Copy this file to 'config.h' and fill in your actual credentials.
  DO NOT commit 'config.h' with sensitive credentials to source control.
*/

#ifndef CONFIG_H
#define CONFIG_H

// Wi-Fi Credentials
#define WIFI_SSID     "Ghe"
#define WIFI_PASSWORD "saisakshi04"

// Backend API Server Details (Use local network IP of Node.js backend server)
#define BACKEND_HOST  "http://10.254.92.115:5000"
#define DEVICE_ID     "SMB-ESP32-001"
#define DEVICE_API_KEY "SMB-ESP32-SECRET-API-KEY-2026"

// Telegram Caretaker Alerts
#define TELEGRAM_BOT_TOKEN "YOUR_TELEGRAM_BOT_TOKEN"
#define TELEGRAM_CHAT_ID   "YOUR_TELEGRAM_CHAT_ID"

// Hardware Test Mode (Set to 1 for software simulation testing without physical sensors)
#define HARDWARE_TEST_MODE 0

#endif // CONFIG_H
