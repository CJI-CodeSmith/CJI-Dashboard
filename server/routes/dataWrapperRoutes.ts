// Defines Express routes for Data Wrapper API endpoints

import { Router } from "express";

//TODO: the controllers in dataWrapperController have to be converted to express route handlers
import { buildDatawrapperChart, getChart, updateChart } from "../controllers/dataWrapperController";

const router = Router();

//* ONE-TIME SETUP ROUTES

// creates the initial chart
router.post('/charts', buildDatawrapperChart);

// gets the embed id for the chart
router.get('/charts/:id/embed', getChart);


//* REUSABLE DATA UPDATE ROUTE
router.put('/charts/:id', updateChart);

export default router;