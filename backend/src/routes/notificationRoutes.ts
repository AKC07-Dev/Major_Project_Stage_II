import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticateCaretaker } from '../middleware/auth';

const router = Router();

router.use(authenticateCaretaker);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
