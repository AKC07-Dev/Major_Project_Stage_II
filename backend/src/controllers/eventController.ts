import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function getEvents(req: Request, res: Response) {
  try {
    const { date, status, boxNumber, limit, filter } = req.query;

    let whereClause: any = {};

    if (status) {
      whereClause.status = String(status).toUpperCase();
    }

    if (boxNumber) {
      whereClause.boxNumber = Number(boxNumber);
    }

    const now = new Date();

    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      whereClause.timestamp = { gte: startOfDay };
    } else if (filter === 'yesterday') {
      const startOfYesterday = new Date(now.setDate(now.getDate() - 1));
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      whereClause.timestamp = { gte: startOfYesterday, lte: endOfYesterday };
    } else if (filter === '7days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      whereClause.timestamp = { gte: sevenDaysAgo };
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      whereClause.timestamp = { gte: thirtyDaysAgo };
    } else if (date) {
      const selectedDate = new Date(String(date));
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      whereClause.timestamp = { gte: startOfDay, lte: endOfDay };
    }

    const events = await prisma.medicationEvent.findMany({
      where: whereClause,
      include: {
        medicine: true,
        schedule: true,
        device: { select: { deviceId: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit ? Number(limit) : 100,
    });

    return res.json({ events });
  } catch (error) {
    console.error('[Get Events Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch medication events.' });
  }
}
