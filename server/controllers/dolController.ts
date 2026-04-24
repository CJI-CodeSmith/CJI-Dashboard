// Fetches OSHA inspection data from the DOL API and returns it as parsed JSON
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import { scrubData } from "../utils/dataScrubber.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// typescript interface for the expected response from dol API get request
interface DOLResponse {
  data: Array<{
    estab_name: string;
    site_address: string;
    site_city: string;
    site_state: string;
    site_zip: string;
    owner_type: string;
    safety_hlth: string;
    naics_code: string;
    insp_type: string;
    union_status: string;
    nr_in_estab: string;
    open_date: string;
  }>;
}

//variable to get the set the year to start with
// const startYear = new Date();
// // setFullYear method passing in (current year - 5) to start from 5 years ago
// startYear.setFullYear(startYear.getFullYear() - 5);
// // convert startYear to string for passing in to fetch request
// const dateString = startYear.toISOString().split(".")[0];

// Pure async function to fetch data from DOL API, write raw data to file, and scrubs it. It's isolated from express, there is no req or res
export const fetchAndScrubData = async (): Promise<{ totalRecords: number }> => {
  console.log("Starting DOL fetch...");
    const filterObj = {
      and: [
        { field: "naics_code", operator: "eq", value: "518210" },
        { field: "open_date", operator: "gt", value: "2021-01-01T00:00:00" },
      ],
    };
// Sample NAICS - 236220 452990 238990 561320
const params = new URLSearchParams({
  "X-API-KEY": process.env.DOL_API_KEY!,
  limit: "200",
  offset: "0",
  fields:
    "estab_name,site_address,site_city,site_state,site_zip,owner_type,safety_hlth,naics_code,insp_type,union_status,nr_in_estab,open_date",
  sort_by: "open_date",
  sort: "asc", //TODO: Dbl check why DESC breaks our sort
  filter_object: JSON.stringify(filterObj),
});

const url = `https://apiprod.dol.gov/v4/get/OSHA/inspection/json?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`DOL API fetch failed: ${response.status} ${response.statusText}`);
  }
  const inspection = (await response.json()) as DOLResponse;
  const records = inspection.data || [];
  // instead of sorting by desc we can just check records.length to see if its larger for now since its in an array.
  console.log(`DOL API fetch successful with: ${records.length} records`);

  const rawFilePath = path.join(__dirname, "../data/Json/rawData.json");

  fs.writeFileSync(rawFilePath, JSON.stringify(records, null, 2));
  console.log("Fetched data has been written into rawData.json");

  // Invoke data scrubbing helper function here so each retrieval is automatically scrubbed and ready for use?
scrubData();
return { totalRecords: records.length };
};
// Express route handler: calls runOshaFetch using the totalRecords from the fetch to send a response to the client. This keeps the function agnostic of express.
export const fetchOshaData = async (req: Request, res: Response) => {
  try {
    const { totalRecords } = await fetchAndScrubData();
    res.status(200).json({
      message: " Successfully extracted DOL Data to rawData.json, scrubbed it and written to cleanedData.json",
      totalRecords,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Error fetching DOL data",
      details: err.message,
    });
  }
};
