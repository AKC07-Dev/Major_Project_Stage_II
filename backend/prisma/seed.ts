import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Smart Medicine Box Database...');

  // Clean existing dynamic seed records for idempotency
  await prisma.notification.deleteMany();
  await prisma.medicationEvent.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.medicine.deleteMany();

  // 1. Create Default Caretaker User
  const passwordHash = await bcrypt.hash('caretaker123', 10);
  const caretaker = await prisma.user.upsert({
    where: { email: 'caretaker@smartbox.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Jenkins (Caretaker)',
      email: 'caretaker@smartbox.com',
      passwordHash,
      role: 'CARETAKER',
    },
  });
  console.log('Caretaker created:', caretaker.email);

  // 2. Create ESP32 Device
  const device = await prisma.device.upsert({
    where: { deviceId: 'SMB-ESP32-001' },
    update: {
      status: 'ONLINE',
      lastSeen: new Date(),
    },
    create: {
      deviceId: 'SMB-ESP32-001',
      name: 'Patient Living Room Smart Box',
      apiKey: 'SMB-ESP32-SECRET-API-KEY-2026',
      status: 'ONLINE',
      lastSeen: new Date(),
      firmwareVersion: 'v1.2.0',
      wifiSignal: -58,
      wifiSsid: 'SmartBox_Home_WiFi',
      ipAddress: '192.168.1.105',
    },
  });
  console.log('Device registered:', device.deviceId);

  // 3. Create Medicines
  const med1 = await prisma.medicine.create({
    data: {
      name: 'Morning Medicine (Blood Pressure)',
      dosage: '1 Tablet (10mg)',
      instructions: 'Take with warm water after breakfast',
      boxNumber: 1,
      active: true,
    },
  });

  const med2 = await prisma.medicine.create({
    data: {
      name: 'Afternoon Medicine (Multivitamin)',
      dosage: '1 Capsule',
      instructions: 'Take after lunch',
      boxNumber: 2,
      active: true,
    },
  });

  const med3 = await prisma.medicine.create({
    data: {
      name: 'Night Medicine (Cholesterol)',
      dosage: '1 Tablet (20mg)',
      instructions: 'Take before sleep',
      boxNumber: 1,
      active: true,
    },
  });
  console.log('Medicines created.');

  // 4. Create Schedules matching prompt requirement
  const sch1 = await prisma.schedule.create({
    data: {
      medicineId: med1.id,
      deviceId: device.id,
      startTime: '08:00',
      endTime: '09:00',
      startHour: 8,
      startMinute: 0,
      endHour: 9,
      endMinute: 0,
      boxNumber: 1,
      enabled: true,
    },
  });

  const sch2 = await prisma.schedule.create({
    data: {
      medicineId: med2.id,
      deviceId: device.id,
      startTime: '13:00',
      endTime: '14:00',
      startHour: 13,
      startMinute: 0,
      endHour: 14,
      endMinute: 0,
      boxNumber: 2,
      enabled: true,
    },
  });

  const sch3 = await prisma.schedule.create({
    data: {
      medicineId: med3.id,
      deviceId: device.id,
      startTime: '20:00',
      endTime: '21:00',
      startHour: 20,
      startMinute: 0,
      endHour: 21,
      endMinute: 0,
      boxNumber: 1,
      enabled: true,
    },
  });
  console.log('Schedules created.');

  // 5. Create 7-day realistic medication history events
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);

    // Morning Dose (08:00)
    const morningTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 8, 4, 12);
    await prisma.medicationEvent.create({
      data: {
        deviceId: device.id,
        scheduleId: sch1.id,
        medicineId: med1.id,
        boxNumber: 1,
        eventType: 'MEDICINE_TAKEN',
        status: 'TAKEN',
        timestamp: morningTime,
      },
    });

    // Afternoon Dose (13:00) - simulate 1 missed dose 3 days ago
    const afternoonTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 13, 15, 0);
    const isMissed = i === 3; // Missed 3 days ago
    await prisma.medicationEvent.create({
      data: {
        deviceId: device.id,
        scheduleId: sch2.id,
        medicineId: med2.id,
        boxNumber: 2,
        eventType: isMissed ? 'MEDICINE_MISSED' : 'MEDICINE_TAKEN',
        status: isMissed ? 'MISSED' : 'TAKEN',
        timestamp: afternoonTime,
      },
    });

    // Night Dose (20:00) - only for past days, not future today
    if (i > 0) {
      const nightTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 20, 2, 45);
      await prisma.medicationEvent.create({
        data: {
          deviceId: device.id,
          scheduleId: sch3.id,
          medicineId: med3.id,
          boxNumber: 1,
          eventType: 'MEDICINE_TAKEN',
          status: 'TAKEN',
          timestamp: nightTime,
        },
      });
    }
  }
  console.log('Historical medication events populated.');

  // 6. Create Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'TAKEN',
        title: '✅ Morning Medicine Taken',
        message: 'Morning Medicine (Box 1) was taken at 08:04 AM.',
        read: true,
      },
      {
        type: 'SYSTEM',
        title: 'ℹ️ System Synchronized',
        message: 'ESP32 Smart Box (SMB-ESP32-001) successfully synchronized 3 medication schedules.',
        read: false,
      },
    ],
  });
  console.log('Notifications seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
