// Defines Express routes for Data Wrapper API endpoints

import { Router } from "express";
import { getAllCharts } from "../controllers/dataWrapperController.ts";

const router = Router();


// single route to return all chart info (IDs, embed codes, published dates) for frontend to render as iframes
//getAllCharts will get chart info from chartInfo.json, NOT an API call.  The getAllCharts function has to check if the json file exists. If not, they get built and data is saved to the json which returns to the front end. If it does exist, just grabs the data from the json and sends to the front end
router.get('/charts', getAllCharts);

// TODO: add a PUT/charts/:id route when the update functionality is built

export default router;


