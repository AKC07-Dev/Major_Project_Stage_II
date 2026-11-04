import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sendTelegramNotification } from '../services/telegram';

export async function getDeviceSchedules(req: Request, res: Response) {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { enabled: true },
      include: { medicine: true },
      orderBy: { startHour: 'asc' },
    });

    const formatted = schedules.map((s) => ({
      id: s.id,
      startHour: s.startHour,
      startMinute: s.startMinute,
      endHour: s.endHour,
      endMinute: s.endMinute,
      boxNumber: s.boxNumber,
      medicineName: s.medicine ? s.medicine.name : 'Medication',
    }));

    // Update device lastSeen
    const device = await prisma.device.findFirst();
    if (device) {
      await prisma.device.update({
        where: { id: device.id },
        data: { lastSeen: new Date(), status: 'ONLINE' },
      });
    }

    return res.json({
      count: formatted.length,
      schedules: formatted,
    });
  } catch (error) {
    console.error('[Device Schedule Sync Error]:', error);
    return res.status(500).json({ error: 'Failed to synchronize schedules.' });
  }
}

export async function recordDeviceEvent(req: Request, res: Response) {
  try {
    const { deviceId, scheduleId, medicineName, boxNumber, eventType, timestamp } = req.body;

    if (!boxNumber || !eventType) {
      return res.status(400).json({ error: 'boxNumber and eventType are required.' });
    }

    const boxNum = Number(boxNumber);
    const now = timestamp ? new Date(timestamp) : new Date();

    // Locate device record
    let device = await prisma.device.findFirst({
      where: deviceId ? { deviceId } : undefined,
    });

    if (!device) {
      device = await prisma.device.findFirst();
      if (!device) {
        return res.status(400).json({ error: 'Device record not found.' });
      }
    }

    // Attempt to match active schedule or medicine if available
    let matchedMedicineId: string | undefined = undefined;
    if (scheduleId) {
      const sch = await prisma.schedule.findUnique({ where: { id: scheduleId } });
      if (sch) matchedMedicineId = sch.medicineId;
    }

    if (!matchedMedicineId && medicineName) {
      const med = await prisma.medicine.findFirst({ where: { name: medicineName } });
      if (med) matchedMedicineId = med.id;
    }

    // Deduplication check: prevent duplicate events inserted within 60 seconds
    const oneMinAgo = new Date(now.getTime() - 60 * 1000);
    const existingRecent = await prisma.medicationEvent.findFirst({
      where: {
        deviceId: device.id,
        boxNumber: boxNum,
        eventType,
        timestamp: { gte: oneMinAgo },
      },
    });

    if (existingRecent) {
      return res.status(200).json({
        message: 'Duplicate event ignored (idempotent)',
        event: existingRecent,
      });
    }

    const statusStr = eventType === 'MEDICINE_TAKEN' ? 'TAKEN' : eventType === 'MEDICINE_MISSED' ? 'MISSED' : 'PENDING';

    const event = await prisma.medicationEvent.create({
      data: {
        deviceId: device.id,
        scheduleId: scheduleId || null,
        medicineId: matchedMedicineId || null,
        boxNumber: boxNum,
        eventType,
        status: statusStr,
        timestamp: now,
        metadata: JSON.stringify({ rawInput: req.body }),
      },
      include: { medicine: true },
    });

    // Update device status to ONLINE
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeen: now, status: 'ONLINE' },
    });

    // Create system Notification
    const nameToDisplay = event.medicine ? event.medicine.name : medicineName || `Box ${boxNum} Medicine`;
    const notificationTitle = eventType === 'MEDICINE_TAKEN'
      ? '✅ Medicine Taken'
      : eventType === 'MEDICINE_MISSED'
      ? '⚠️ Medicine Missed'
      : '🔔 Medicine Reminder';

    const notificationMessage = `${nameToDisplay} (Box ${boxNum}) ${
      eventType === 'MEDICINE_TAKEN' ? 'was taken successfully' : eventType === 'MEDICINE_MISSED' ? 'was missed' : 'is due now'
    }.`;

    await prisma.notification.create({
      data: {
        type: eventType === 'MEDICINE_TAKEN' ? 'TAKEN' : eventType === 'MEDICINE_MISSED' ? 'MISSED' : 'REMINDER',
        title: notificationTitle,
        message: notificationMessage,
      },
    });

    // Send Telegram Notification to Caretaker
    const telegramText = `${notificationTitle}\n\nMedicine: ${nameToDisplay}\nBox: ${boxNum}\nTime: ${now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}\nStatus: ${statusStr}`;
    sendTelegramNotification(telegramText);

    return res.status(201).json({
      message: 'Event recorded successfully',
      event,
    });
  } catch (error: any) {
    console.error('[Record Device Event Error]:', error);
    return res.status(500).json({ error: 'Failed to record device event.' });
  }
}

export async function deviceHeartbeat(req: Request, res: Response) {
  try {
    const { deviceId, wifiSignal, firmwareVersion, ipAddress, wifiSsid } = req.body;

    let device = await prisma.device.findFirst({
      where: deviceId ? { deviceId } : undefined,
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found.' });
    }

    const now = new Date();
    const rssi = wifiSignal ? Number(wifiSignal) : device.wifiSignal;

    await prisma.device.update({
      where: { id: device.id },
      data: {
        status: 'ONLINE',
        lastSeen: now,
        wifiSignal: rssi,
        ...(firmwareVersion && { firmwareVersion }),
        ...(ipAddress && { ipAddress }),
        ...(wifiSsid && { wifiSsid }),
      },
    });

    await prisma.deviceHeartbeat.create({
      data: {
        deviceId: device.id,
        timestamp: now,
        wifiSignal: rssi,
        firmwareVersion: firmwareVersion || device.firmwareVersion,
      },
    });

    return res.json({ status: 'ONLINE', timestamp: now });
  } catch (error) {
    return res.status(500).json({ error: 'Heartbeat processing failed.' });
  }
}

export async function getDeviceStatus(req: Request, res: Response) {
  try {
    const device = await prisma.device.findFirst({
      include: {
        _count: { select: { events: true, schedules: true } },
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'No device registered.' });
    }

    // Determine online/offline status based on 2-minute heartbeat timeout
    const now = new Date();
    const isOnline = device.lastSeen ? (now.getTime() - new Date(device.lastSeen).getTime()) < 2 * 60 * 1000 : false;
    const computedStatus = isOnline ? 'ONLINE' : 'OFFLINE';

    if (device.status !== computedStatus) {
      await prisma.device.update({
        where: { id: device.id },
        data: { status: computedStatus },
      });
    }

    return res.json({
      device: {
        ...device,
        status: computedStatus,
        isOnline,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch device status.' });
  }
}
