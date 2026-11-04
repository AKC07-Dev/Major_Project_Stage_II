import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

function parseTimeString(timeStr: string) {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  const hour = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(min) || hour < 0 || hour > 23 || min < 0 || min > 59) {
    return null;
  }
  return { hour, min, totalMinutes: hour * 60 + min };
}

export async function getSchedules(req: Request, res: Response) {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        medicine: true,
        device: { select: { id: true, deviceId: true, name: true, status: true } },
      },
      orderBy: { startHour: 'asc' },
    });
    return res.json({ schedules });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch medication schedules.' });
  }
}

export async function createSchedule(req: Request, res: Response) {
  try {
    const { medicineId, deviceId, startTime, endTime, boxNumber, enabled } = req.body;

    if (!medicineId || !startTime || !endTime || !boxNumber) {
      return res.status(400).json({ error: 'Medicine, Start Time, End Time, and Box Number are required.' });
    }

    const startParsed = parseTimeString(startTime);
    const endParsed = parseTimeString(endTime);

    if (!startParsed || !endParsed) {
      return res.status(400).json({ error: 'Invalid time format. Please use HH:MM (24-hour format e.g. 08:00).' });
    }

    if (endParsed.totalMinutes <= startParsed.totalMinutes) {
      return res.status(400).json({ error: 'Schedule end time must be strictly after start time.' });
    }

    const boxNum = Number(boxNumber);
    if (boxNum !== 1 && boxNum !== 2) {
      return res.status(400).json({ error: 'Box number must be 1 or 2.' });
    }

    // Default to first active device if deviceId not explicitly supplied
    let targetDeviceId = deviceId;
    if (!targetDeviceId) {
      const defaultDevice = await prisma.device.findFirst();
      if (!defaultDevice) {
        return res.status(400).json({ error: 'No active ESP32 device found in database. Please register a device first.' });
      }
      targetDeviceId = defaultDevice.id;
    }

    // Conflict detection: check if another schedule on the SAME box overlaps
    const existingSchedules = await prisma.schedule.findMany({
      where: {
        boxNumber: boxNum,
        enabled: true,
      },
    });

    let warning = null;
    for (const s of existingSchedules) {
      const sStart = s.startHour * 60 + s.startMinute;
      const sEnd = s.endHour * 60 + s.endMinute;

      // Overlap check
      if (
        (startParsed.totalMinutes >= sStart && startParsed.totalMinutes < sEnd) ||
        (endParsed.totalMinutes > sStart && endParsed.totalMinutes <= sEnd) ||
        (startParsed.totalMinutes <= sStart && endParsed.totalMinutes >= sEnd)
      ) {
        warning = `Note: This schedule overlaps with an existing Box ${boxNum} schedule (${s.startTime} - ${s.endTime}).`;
        break;
      }
    }

    const schedule = await prisma.schedule.create({
      data: {
        medicineId,
        deviceId: targetDeviceId,
        startTime,
        endTime,
        startHour: startParsed.hour,
        startMinute: startParsed.min,
        endHour: endParsed.hour,
        endMinute: endParsed.min,
        boxNumber: boxNum,
        enabled: enabled !== undefined ? Boolean(enabled) : true,
      },
      include: { medicine: true },
    });

    return res.status(201).json({ schedule, warning });
  } catch (error: any) {
    console.error('[Create Schedule Error]:', error);
    return res.status(500).json({ error: 'Failed to create medication schedule.' });
  }
}

export async function updateSchedule(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { startTime, endTime, boxNumber, enabled, medicineId } = req.body;

    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    let startHour = existing.startHour;
    let startMinute = existing.startMinute;
    let endHour = existing.endHour;
    let endMinute = existing.endMinute;
    let newStartTime = existing.startTime;
    let newEndTime = existing.endTime;

    if (startTime) {
      const parsed = parseTimeString(startTime);
      if (!parsed) return res.status(400).json({ error: 'Invalid start time format.' });
      startHour = parsed.hour;
      startMinute = parsed.min;
      newStartTime = startTime;
    }

    if (endTime) {
      const parsed = parseTimeString(endTime);
      if (!parsed) return res.status(400).json({ error: 'Invalid end time format.' });
      endHour = parsed.hour;
      endMinute = parsed.min;
      newEndTime = endTime;
    }

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        ...(medicineId && { medicineId }),
        ...(startTime && { startTime: newStartTime, startHour, startMinute }),
        ...(endTime && { endTime: newEndTime, endHour, endMinute }),
        ...(boxNumber && { boxNumber: Number(boxNumber) }),
        ...(enabled !== undefined && { enabled: Boolean(enabled) }),
      },
      include: { medicine: true },
    });

    return res.json({ schedule: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update schedule.' });
  }
}

export async function deleteSchedule(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.schedule.delete({ where: { id } });
    return res.json({ message: 'Schedule deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete schedule.' });
  }
}
