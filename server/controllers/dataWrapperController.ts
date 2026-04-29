// Fetches data from the Data Wrapper API and returns it for use by the dashboard

import "dotenv/config";

import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import updateChartMetadata from "../utils/updateChartMetadata.ts";
import { checkFile } from "../server.ts";

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
  totalRecords: number;
  charts: Charts[];
}
const chartsInfo: ChartsInfo = {
  latestFetchDate: Date.now(),
  totalRecords: 0,
  charts: [],
}; 
export const getChartsInfo = async (_req: Request, res: Response) => {
  const chartsInfoPath = path.join(__dirname, "../chartsInfo.json");
  try {
    const info = fs.readFileSync(chartsInfoPath, "utf-8");
    return res.status(200).json(JSON.parse(info));
  } catch (err) {
    return res.status(500).json({ error: "Failed to read chartsInfo.json" });
  }
};
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
const summaryDataPath = path.join(__dirname, "../data/Json/summaryData.json");

export const buildCharts = async () => {
  const data = fs.readFileSync(summaryDataPath, "utf-8");
  const records = JSON.parse(data);
  // Resets chartsInfo.json before building so repeated calls don't accumulate additional entries within the file.
  chartsInfo.charts = [];
  chartsInfo.latestFetchDate = Date.now();
  chartsInfo.totalRecords = records.totalRecords;


  const csv1PieUvNu = fs.readFileSync(unionCsvPath, "utf-8");
  const csv2PieHvS = fs.readFileSync(inspFocusCsvPath, "utf-8");
  const csv3BarInspectionTypes = fs.readFileSync(inspTypeCsvPath, "utf-8");

  try {
    await buildDatawrapperChart(
      "Union vs. Non-Union Inspection Count",
      csv1PieUvNu,
    );
    await buildDatawrapperChart(
      "Health vs. Safety Inspection Count",
      csv2PieHvS,
      "d3-pies",
      1,
    );
    await buildDatawrapperChart(
      "Inspection Types",
      csv3BarInspectionTypes,
      "d3-bars",
    );
    const chartsInfoPath = path.join(__dirname, "../chartsInfo.json");
    fs.writeFileSync(chartsInfoPath, JSON.stringify(chartsInfo, null, 2));
    console.log("chartsInfo.json successfully created.");
  } catch (err) {
    console.error("Built charts failed, chartsInfo.json not written: ", err);
  }

  async function buildDatawrapperChart(
    title: any,
    csvData: string | any,
    chartType: string = "d3-pies",
    paletteVariant: number = 0,
  ) {
    //Endpoint for chart creation
    const createRes = await fetch(`${BASE_URL}/charts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DWAPI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, type: `${chartType}` }), //here is where the different chart types come into play, our donuts etc.
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.log("createRes not okay");
      throw new Error(`Create failed: ${errorText}`);
    }

    const chartData = await createRes.json();
    const chartId = chartData.id;
    console.log(`Created chart with ID#: ${chartId}`);
    //Uploads the csv data
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

    //Extracts csv category names for updating chart metadata
    const getCategories = (csv: string): string[] =>
      csv
        .trim()
        .split("\n")
        .slice(1)
        .map((row) => row.split(",")[0]);

    const categories = getCategories(csvData);

    const publishRes = await fetch(`${BASE_URL}/charts/${chartId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${DWAPI_KEY}` },
    });

    //Patch chart metadata before publish (make charts have percentages and different colors)
    const chartMetadata = updateChartMetadata(chartType, categories, paletteVariant);
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
     
    }

    // Second publish to make the color metadata go live
    const republishRes = await fetch(`${BASE_URL}/charts/${chartId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${DWAPI_KEY}` },
    });

    if (!republishRes.ok) {
      const errorText = await republishRes.text();
      throw new Error(`Republish failed: ${errorText}`);
    }

    const publishData = await republishRes.json();
    const url: string = publishData.url;
    const publicUrl: string = publishData.publicUrl;

    const newChartInfo: Charts = {
      chartName: publishData.data.title,
      chartID: publishData.data.id,
      embedCode:
        publishData.data.metadata?.publish?.["embed-codes"]?.[
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
    return finalUrl;
  }
};

export const updateAllCharts = async () => {

  await getChartsInfo();
  async function getChartsInfo() {
    const chartsInfoPath = path.join(__dirname, "../chartsInfo.json");
    try {
      const info = await fs.promises.readFile(chartsInfoPath, "utf-8");
      const data = JSON.parse(info);


      //Read the updated csv data from server startup.
      const freshCsv1 = fs.readFileSync(unionCsvPath, "utf-8");
      const freshCsv2 = fs.readFileSync(inspFocusCsvPath, "utf-8");
      const freshCsv3 = fs.readFileSync(inspTypeCsvPath, "utf-8");
      await updateChart(data.charts[0]["chartID"], {}, freshCsv1);
      await updateChart(data.charts[1]["chartID"], {}, freshCsv2);
      await updateChart(data.charts[2]["chartID"], {}, freshCsv3);
      data.latestFetchDate = Date.now();
      await fs.promises.writeFile(
        chartsInfoPath,
        JSON.stringify(data, null, 2),
      );
      console.log("chartsInfo.json latestFetchDate reset.");
    } catch (err) {
      console.error("error at reading", err);
    }
  }

  //Updates allows us to edit the chart title and other elements via the metadata.
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

      //Updating optional new data, which replaces previous data completely.
      if (newCsvData) {
        const uploadRes = await fetch(`${BASE_URL}/charts/${id}/data`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${DWAPI_KEY}`,
            "Content-Type": "text/csv",
          },
          body: newCsvData,
        });
        if (!uploadRes.ok) throw new Error("Data upload failed");
        console.log("New data uploaded successfully.");
      }

      //Need to republish for public API viewing

      const publishRes = await fetch(`${BASE_URL}/charts/${id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${DWAPI_KEY}` },
      });

      if (!publishRes.ok) throw new Error("Re-publish failed");

      const publishData = await publishRes.json();
      const finalUrl =
        publishData.publicUrl || `https://datawrapper.dwcdn.net/${id}/`;

      console.log(`Update Live! View here: ${finalUrl}`);
      return finalUrl;
    } catch (error) {
      console.error("Error in updateChart in dataWrapperController");
    }
  }
};
