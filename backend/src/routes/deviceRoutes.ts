import { Router } from 'express';
import { getDeviceSchedules, recordDeviceEvent, deviceHeartbeat, getDeviceStatus } from '../controllers/deviceController';
import { authenticateDevice } from '../middleware/auth';

const router = Router();

// Endpoint for physical ESP32 to pull schedules
router.get('/schedules', getDeviceSchedules);

// Endpoint for physical ESP32 to push events
router.post('/events', recordDeviceEvent);

// Endpoint for physical ESP32 heartbeat
router.post('/heartbeat', deviceHeartbeat);

// Endpoint for frontend dashboard status
router.get('/status', getDeviceStatus);

export default router;
