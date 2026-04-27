// Defines Express routes for Data Wrapper API endpoints

import { Router } from 'express';
import { buildCharts, getChartsInfo} from '../controllers/dataWrapperController.ts';

const router = Router();

// single route to return all chart info (IDs, embed codes, published dates) for frontend to render as iframes
//getAllCharts will get chart info from chartInfo.json, NOT an API call.  The getAllCharts function has to check if the json file exists. If not, they get built and data is saved to the json which returns to the front end. If it does exist, just grabs the data from the json and sends to the front end

//! Do we need to remove this route since we now build the charts directly in the server file if the chartsInfo.json doesn't exist?
router.get('/charts', buildCharts);

router.get('/chart-info', getChartsInfo);

// TODO: add a PUT/charts/:id route when the update functionality is built

export default router;
