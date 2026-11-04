import { Router } from 'express';
import { login, getMe, logout } from '../controllers/authController';
import { authenticateCaretaker } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateCaretaker, getMe);

export default router;
