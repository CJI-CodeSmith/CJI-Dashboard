// Fetches data from the Data Wrapper API and returns it for use by the dashboard
// TODO: import express and convert functions into express route handlers  - for each function params must be:( req: Request, res: Response) and the currently passed in params have to be pulled from req.params or req.body, then return res.status(200).json(...) instead of returning the actual values

//TODO: all catch blocks should call res.status(500).json({ error plus whatever info })
import dotenv from 'dotenv';
// import 'dotenv/config';
dotenv.config({ path: '../.env' });
// dotenv.config();
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DWAPI_KEY = process.env.DWAPI_KEY;

const BASE_URL = `https://api.datawrapper.de/v3`;

interface Charts {
  chartName: string;
  chartID: string;
  embedCode?: string;
  publishedDate: string;
  totalViolations?: number;
  chartType: string;
}

interface ChartsInfo {
  latestFetchDate: string | number;
  charts: Charts[];
}
const chartsInfo: ChartsInfo = {
  latestFetchDate: Date.now(),
  charts: [],
}; //need to figure out this type for an array of ChartsInfo
export const getChartsInfo = async (_req: Request, res: Response) => {
  const chartsInfoPath = path.join(__dirname, "../chartsInfo.json");
  try {
    const info = await fs.promises.readFile(chartsInfoPath, "utf-8");
    return res.status(200).json(JSON.parse(info));
  } catch (err) {
    return res.status(500).json({ error: "Failed to read chartsInfo.json" });
  }
};
const unionCsvPath = path.join(
  __dirname,
  '../data/visualization/unionStatus.csv',
);
const inspFocusCsvPath = path.join(
  __dirname,
  '../data/visualization/inspFocus.csv',
);
const inspTypeCsvPath = path.join(
  __dirname,
  '../data/visualization/inspType.csv',
);

const csv1PieUvNu = fs.readFileSync(unionCsvPath, 'utf-8');
const csv2PieHvS = fs.readFileSync(inspFocusCsvPath, 'utf-8');
const csv3BarInspectionTypes = fs.readFileSync(inspTypeCsvPath, 'utf-8');
export const buildCharts = async () => {
  const unionCsvPath = path.join(
    __dirname,
    "../data/visualization/unionStatus.csv",
  );
  const inspFocusCsvPath = path.join(
    __dirname,
    "../data/visualization/inspFocus.csv",
  );
  const inspTypeCsvPath = path.join(
    __dirname,
    "../data/visualization/inspType.csv",
  );

  const csv1PieUvNu = fs.readFileSync(unionCsvPath, "utf-8");
  const csv2PieHvS = fs.readFileSync(inspFocusCsvPath, "utf-8");
  const csv3BarInspectionTypes = fs.readFileSync(inspTypeCsvPath, "utf-8");

  await buildDatawrapperChart(
    "Union vs. Non-Union Inspection Count",
    csv1PieUvNu,
  );
  await buildDatawrapperChart("Health vs. Safety Inspection Count", csv2PieHvS);
  await buildDatawrapperChart(
    "Inspection Types",
    csv3BarInspectionTypes,
    "d3-bars",
  );

  async function buildDatawrapperChart(
    title: string,
    csvData: string | any,
    chartType: string = "d3-pies",
  ) {
    //charts endpoint for creating
    try {
      const createRes = await fetch(`${BASE_URL}/charts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DWAPI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, type: `${chartType}` }), //here is where the different chart types come into play, our donuts etc
      });
      console.log("made it to createRes");

      //Checking if the response is successful
      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.log("createRes not okay");
        throw new Error(`Create failed: ${errorText}`);
      }

      const chartData = await createRes.json();
      const chartId = chartData.id;
      console.log(`Created chart with ID#: ${chartId}`);
      //TODO CREATE INTERFACES FOR DIFF CHARTS AND PUSH TO ARRAY
      //UPLOADING THE CSV DATA
      const uploadRes = await fetch(`${BASE_URL}/charts/${chartId}/data`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${DWAPI_KEY}`,
          "Content-Type": "text/csv",
        },
        body: csvData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      console.log("Data uploaded successfully.");

      //Patch chart metadata before publish (make charts have percentages and different colors)
      const chartMetadata = updateChartMetadata(chartType);
      if (chartMetadata) {
        const metaRes = await fetch(`${BASE_URL}/charts/${chartId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${DWAPI_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metadata: { visualize: chartMetadata },
          }),
        });
        if (!metaRes.ok)
          throw new Error(`Metadata patch failed: ${await metaRes.text()}`);
        console.log("Percentage and color styling metadata applied.");
      }

      //PUBLISHING THE NEW CHART because we need to publish in order to see the adjusted data
      const publishRes = await fetch(`${BASE_URL}/charts/${chartId}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${DWAPI_KEY}` },
      });

      const publishData = await publishRes.json();
      const url: string = publishData.url;
      const publicUrl: string = publishData.publicUrl;

      const newChartInfo: Charts = {
        chartName: publishData.data.title,
        chartID: publishData.data.id,
        embedCode:
          publishData.data.metadata.publish["embed-codes"][
            "embed-method-responsive"
          ],
        publishedDate: publishData.data.publishedAt,
        chartType: publishData.data.type,
      };

      chartsInfo.charts.push(newChartInfo);
      console.log("CHARTS INFO: ", chartsInfo);
      //Datawrapper can use publicUrl or url depending on the state, so we use finalUrl to catch both
      const finalUrl = publicUrl || url;

      console.log(`Chart is live at: ${finalUrl}`);
      //might not need to return this, but instead return the other obj
      return finalUrl;
    } catch (error) {
      console.error("Process stopped: ", error);
    }
  }

  //writing the chartsInfo to a json object
  const chartsInfoJSON = JSON.stringify(chartsInfo);
  fs.writeFile("chartsInfo.json", chartsInfoJSON, (err) => {
    if (err) {
      console.error("Error writing chartsInfo.json: ", err);
    } else {
      console.log(`chartsInfoJSON successfully created.`);
    }
  });
};

async function getChart(id: string) {
  try {
    const getChartResponse = await fetch(`${BASE_URL}/charts/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${DWAPI_KEY}`,
        accept: "*/*",
      },
    });

    if (!getChartResponse.ok) {
      throw new Error(
        "Issue getting response from dataWrapperController's getChart",
      );
    }
    const data = await getChartResponse.json();

    const publicUrl = data.publicUrl; //clickable for public access
    const imageUrl = `https://datawrapper.dwcdn.net/${id}/full.png`; //static image
  } catch (error) {
    console.error("Error in getChartResponse in dataWrapperController");
  }
}

//TODO: export updateChart to be used in routes
async function updateChart(id: string, updates: object, newCsvData?: string) {
  try {
    const patchRes = await fetch(`${BASE_URL}/charts/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${DWAPI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!patchRes.ok)
      throw new Error(`Metadata update failed: ${await patchRes.text()}`);
    console.log("Metadata updated successfully.");

    //inputting optional new data (this seems to replace previous data completely)
    if (newCsvData) {
      const uploadRes = await fetch(`${BASE_URL}/charts/${id}/data`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${DWAPI_KEY}`,
          "Content-Type": "text/csv",
        },
        body: JSON.stringify(updates),
      });
      if (!uploadRes.ok) throw new Error("Data upload failed");
      console.log("New data uploaded successfully.");
    }

      //Need to republish for public API viewing

      const publishRes = await fetch(`${BASE_URL}/charts/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${DWAPI_KEY}` },
      });

      if (!publishRes.ok) throw new Error('Re-publish failed');

      const publishData = await publishRes.json();
      const finalUrl =
        publishData.publicUrl || `https://datawrapper.dwcdn.net/${id}/`;

    console.log(`Update Live! View here: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    console.error("Error in updateChart in dataWrapperController");
  }
};
