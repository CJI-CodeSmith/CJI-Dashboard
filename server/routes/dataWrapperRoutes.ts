// Defines Express routes for Data Wrapper API endpoints

import { Router } from "express";
import { getAllCharts } from "../controllers/dataWrapperController.ts";

const router = Router();


// single route to return all chart info (IDs, embed codes, published dates) for frontend to render as iframes
router.get('/charts', getAllCharts);

// TODO: add a PUT/charts/:id route when the update functionality is built

export default router;


