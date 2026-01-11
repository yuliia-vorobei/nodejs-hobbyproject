import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { createCrochetFile } from '../controllers/crochet.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/', ctrlWrapper(createCrochetFile));

export default router;
