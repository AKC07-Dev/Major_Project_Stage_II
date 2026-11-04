import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function getNotifications(req: Request, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
      return res.json({ message: 'All notifications marked as read.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return res.json({ notification: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
}
