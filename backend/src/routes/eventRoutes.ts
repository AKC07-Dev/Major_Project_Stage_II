import { Router } from 'express';
import { getEvents } from '../controllers/eventController';
import { authenticateCaretaker } from '../middleware/auth';

const router = Router();

router.use(authenticateCaretaker);

router.get('/', getEvents);

export default router;
