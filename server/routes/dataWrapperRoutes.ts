import { Router } from 'express';
import { getChartsInfo } from '../controllers/dataWrapperController.ts';

const router = Router();

router.get('/chart-info', getChartsInfo);

export default router;
