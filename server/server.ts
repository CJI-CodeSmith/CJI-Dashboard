// Entry point: loads environment variables, mounts routes, and starts the Express server

import 'dotenv/config';
import app from './app.ts';
import dolRoutes from './routes/dolRoutes.ts';
import dataWrapperRoutes from './routes/dataWrapperRoutes.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';

//TODO: import updateAllCharts function
import { fetchAndScrubData } from './controllers/dolController.ts';
import {
  buildCharts,
  updateAllCharts,
} from './controllers/dataWrapperController.ts';

const PORT = process.env.PORT || 8888;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// setup for DOL routes
app.use('/api', dolRoutes);

// setup for Datawrapper routes
app.use('/api/datawrapper', dataWrapperRoutes);

interface Error {
  log?: string;
  status?: number;
  message?: any;
}

app.use((err: Error, _req: Request, res: Response) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

/*
initialization function:
check if chartInfo.json exists and calls appropriate functions depending
*/

export async function checkFile() {
  const chartsInfoPath = path.join(__dirname, 'chartsInfo.json');
  try {
    let fileExists = fs.existsSync(chartsInfoPath);
    if (!fileExists) {
      await fetchAndScrubData();
      console.log('First dol data fetch initiated');
      await buildCharts();
      console.log('First charts built');
    }
    // new conditional to check the most recent save date -> if more than 30 days, catch fetch and build functions again
    else {
      console.log('chartsInfo.json already exists');
      const chartsInfo = fs.readFileSync(chartsInfoPath, 'utf-8');
      const charts = JSON.parse(chartsInfo);
      const lastFetch = new Date(charts.latestFetchDate);
      const dateToday = new Date();
      //get date diff in milliseconds
      const msDiff = Math.abs(dateToday.getTime() - lastFetch.getTime());
      // get date diff in days(milliseconds->seconds->minutes->hours->days)
      const daysDiff = msDiff / (1000 * 60 * 60 * 24);
      if (daysDiff >= 30) {
        console.log("It's been 30 days!");
        await fetchAndScrubData();
        await updateAllCharts();
      }
    }
  } catch (err) {
    console.error(err);
  }
}
(async () => {
  try {
    await checkFile();
  } catch (err) {
    console.error('Startup checkFile error:', err);
  }
  app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
  })
})();
