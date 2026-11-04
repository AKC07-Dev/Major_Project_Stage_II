import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticateCaretaker(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }

  req.user = decoded;
  next();
}

export function authenticateDevice(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-device-api-key'] || req.headers['authorization'];
  const expectedKey = process.env.DEVICE_API_KEY || 'SMB-ESP32-SECRET-API-KEY-2026';

  if (!apiKey || (apiKey !== expectedKey && apiKey !== `Bearer ${expectedKey}`)) {
    return res.status(401).json({ error: 'Unauthorized physical device request. Invalid device API key.' });
  }

  next();
}
