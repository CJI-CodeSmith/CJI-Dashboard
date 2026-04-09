// Fetches OSHA inspection data from the DOL API and returns it as parsed JSON

import "dotenv/config";

// typescript interface for the expected response from dol API get request
// TODO: add extra fields Avalon requested
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

// TODO: change filtering to start at 2021-1-1 and go forward from there
//variable to get the set the year to start with
const startYear = new Date();
// setFullYear method passing in (current year - 5) to start from 5 years ago
startYear.setFullYear(startYear.getFullYear() - 5);
// convert startYear to string for passing in to fetch request
const dateString = startYear.toISOString().split(".")[0];

// create the object to filter by both naics code and starting date
const filterObj = {
  and: [
    {
      field: "naics_code",
      operator: "eq",
      value: "518210",
    },
    {
      field: "open_date",
      operator: "gt",
      value: "2021-01-01T00:00:00",
    },
  ],
};

//object to hold all the search params to pass in to fetch request
// * current limit is set to 200, but we can change if we want more/less at a time
const params = new URLSearchParams({
  "X-API-KEY": process.env.DOL_API_KEY!,
  limit: "200",
  offset: "0",
  fields:
    "estab_name,site_address,site_city,site_state,site_zip,owner_type,safety_hlth,naics_code,insp_type,union_status,nr_in_estab,open_date",
  sort: "asc",
  filter_object: JSON.stringify(filterObj),
});

const url = `https://apiprod.dol.gov/v4/get/OSHA/inspection/json?${params}`;

export async function fetchInspections() {
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log("Raw response:", text.slice(0, 500));
    const json = JSON.parse(text) as DOLResponse;
    return json.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
