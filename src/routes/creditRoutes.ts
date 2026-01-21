import { Router } from 'express';
import { createCredit, getCredits, getCredit, registerPayment } from '../controllers/creditController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createCredit);
router.get('/', getCredits);
router.get('/:id', getCredit);
router.post('/:id/payments', registerPayment);

export default router;
