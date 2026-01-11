import { Router } from 'express';
import authRouter from './auth.js';
import crochetRouter from './crochet.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/crochet', crochetRouter);

export default router;
