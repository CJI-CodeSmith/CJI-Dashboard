// Entry point: loads environment variables, mounts routes, and starts the Express server

import "dotenv/config";
import app from "./app.ts";
import dolRoutes from "./routes/dolRoutes.ts";
import dataWrapperRoutes from "./routes/dataWrapperRoutes.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ! the below functions need to be created first -> check export names to make sure they match
import { fetchAndScrubData } from "./controllers/dolController.ts";
import { buildAllCharts } from "./controllers/dataWrapperController.ts";

const PORT = process.env.PORT || 8888;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// setup for DOL routes
app.use("/api", dolRoutes);

// setup for Datawrapper routes
app.use("/api/datawrapper", dataWrapperRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

/*
initialization function:
check if chartInfo.json exists and calls appropriate functions depending
*/

async function checkFile() {
  const chartInfoPath = path.join(__dirname, "data/chartInfo.json");
  try {
    let fileExists = fs.existsSync(chartInfoPath);
    if (!fileExists) {
      await fetchAndScrubData();
      await buildAllCharts();
    }
    // else, if it exists, what?
  } catch (err) {
    console.error(err);
  }
}

checkFile();
