import { Router } from 'express';
import { getAnalyticsSummary, getAdherenceTrends, getMedicineAnalytics, getBoxAnalytics } from '../controllers/analyticsController';
import { authenticateCaretaker } from '../middleware/auth';

const router = Router();

router.use(authenticateCaretaker);

router.get('/summary', getAnalyticsSummary);
router.get('/adherence', getAdherenceTrends);
router.get('/medicines', getMedicineAnalytics);
router.get('/boxes', getBoxAnalytics);

export default router;
