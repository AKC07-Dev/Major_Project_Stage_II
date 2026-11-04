import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function getAnalyticsSummary(req: Request, res: Response) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Get today's events
    const todayEvents = await prisma.medicationEvent.findMany({
      where: { timestamp: { gte: startOfToday } },
    });

    const activeSchedules = await prisma.schedule.findMany({
      where: { enabled: true },
      include: { medicine: true },
    });

    const totalTodayDoses = activeSchedules.length;
    const takenCount = todayEvents.filter((e) => e.status === 'TAKEN').length;
    const missedCount = todayEvents.filter((e) => e.status === 'MISSED').length;
    const pendingCount = Math.max(0, totalTodayDoses - (takenCount + missedCount));

    const todayAdherence = (takenCount + missedCount) > 0
      ? Math.round((takenCount / (takenCount + missedCount)) * 100)
      : totalTodayDoses > 0 ? Math.round((takenCount / totalTodayDoses) * 100) : 100;

    // Overall total events
    const allEvents = await prisma.medicationEvent.findMany({
      select: { eventType: true, status: true, boxNumber: true, medicineId: true },
    });

    const totalHistoricalTaken = allEvents.filter((e) => e.status === 'TAKEN').length;
    const totalHistoricalMissed = allEvents.filter((e) => e.status === 'MISSED').length;
    const overallTotal = totalHistoricalTaken + totalHistoricalMissed;
    const overallAdherence = overallTotal > 0 ? Math.round((totalHistoricalTaken / overallTotal) * 100) : 100;

    // Box breakdown
    const box1Taken = allEvents.filter((e) => e.boxNumber === 1 && e.status === 'TAKEN').length;
    const box2Taken = allEvents.filter((e) => e.boxNumber === 2 && e.status === 'TAKEN').length;
    const mostUsedBox = box1Taken >= box2Taken ? 1 : 2;

    return res.json({
      summary: {
        todayDoses: totalTodayDoses,
        takenToday: takenCount,
        missedToday: missedCount,
        pendingToday: pendingCount,
        todayAdherence,
        overallAdherence,
        totalEventsCount: allEvents.length,
        mostUsedBox,
      },
    });
  } catch (error) {
    console.error('[Analytics Summary Error]:', error);
    return res.status(500).json({ error: 'Failed to calculate analytics summary.' });
  }
}

export async function getAdherenceTrends(req: Request, res: Response) {
  try {
    const days = 7;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayEvents = await prisma.medicationEvent.findMany({
        where: { timestamp: { gte: startOfDay, lte: endOfDay } },
      });

      const taken = dayEvents.filter((e) => e.status === 'TAKEN').length;
      const missed = dayEvents.filter((e) => e.status === 'MISSED').length;
      const total = taken + missed;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 100;

      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      result.push({
        date: dayLabel,
        rawDate: d.toISOString().split('T')[0],
        taken,
        missed,
        total,
        adherence,
      });
    }

    return res.json({ trends: result });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch adherence trends.' });
  }
}

export async function getMedicineAnalytics(req: Request, res: Response) {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        events: true,
      },
    });

    const breakdown = medicines.map((med) => {
      const taken = med.events.filter((e) => e.status === 'TAKEN').length;
      const missed = med.events.filter((e) => e.status === 'MISSED').length;
      const total = taken + missed;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 100;

      return {
        id: med.id,
        name: med.name,
        boxNumber: med.boxNumber,
        dosage: med.dosage,
        taken,
        missed,
        total,
        adherence,
      };
    });

    return res.json({ medicines: breakdown });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch medicine analytics.' });
  }
}

export async function getBoxAnalytics(req: Request, res: Response) {
  try {
    const events = await prisma.medicationEvent.findMany({
      select: { boxNumber: true, status: true },
    });

    const box1Taken = events.filter((e) => e.boxNumber === 1 && e.status === 'TAKEN').length;
    const box1Missed = events.filter((e) => e.boxNumber === 1 && e.status === 'MISSED').length;
    const box2Taken = events.filter((e) => e.boxNumber === 2 && e.status === 'TAKEN').length;
    const box2Missed = events.filter((e) => e.boxNumber === 2 && e.status === 'MISSED').length;

    return res.json({
      boxes: [
        { box: 1, taken: box1Taken, missed: box1Missed, total: box1Taken + box1Missed },
        { box: 2, taken: box2Taken, missed: box2Missed, total: box2Taken + box2Missed },
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch box analytics.' });
  }
}
