# ESP32 Hardware Assembly & Flashing Guide

## 1. Required Hardware Components
- ESP32 DevKit Board (30-pin or 38-pin)
- 0.96 inch SSD1306 I2C OLED Display (128x64)
- Box 1 IR Lid Sensor (Connected to GPIO 13)
- Box 2 Proximity Sensor (Connected to GPIO 4)
- Micro-USB Cable
- Breadboard & Jumper Wires

---

## 2. Wiring Diagram Table

| Component | Pin Label | ESP32 Connection Pin |
| :--- | :--- | :--- |
| SSD1306 OLED | VCC | 3.3V |
| SSD1306 OLED | GND | GND |
| SSD1306 OLED | SDA | GPIO 21 |
| SSD1306 OLED | SCL | GPIO 22 |
| Box 1 Lid Sensor | Signal | GPIO 13 (INPUT_PULLUP) |
| Box 2 Hand Sensor | Signal | GPIO 4 (INPUT_PULLUP) |

---

## 3. Required Arduino IDE Libraries
Install the following libraries via **Tools -> Manage Libraries**:
1. `Adafruit GFX Library` by Adafruit
2. `Adafruit SSD1306` by Adafruit

---

## 4. Configuration Steps
1. Open `esp32/SmartMedicineBox.ino` in Arduino IDE.
2. Edit Wi-Fi credentials (`WIFI_SSID`, `WIFI_PASSWORD`).
3. Set `BACKEND_HOST` to your computer's local Wi-Fi IP address (e.g. `http://192.168.1.100:5000`).
4. Select Board: **ESP32 Dev Module** -> Select Port -> Click **Upload**.
