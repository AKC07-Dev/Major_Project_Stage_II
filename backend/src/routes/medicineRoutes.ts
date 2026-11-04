import { Router } from 'express';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../controllers/medicineController';
import { authenticateCaretaker } from '../middleware/auth';

const router = Router();

router.use(authenticateCaretaker);

router.get('/', getMedicines);
router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

export default router;
