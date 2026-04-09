// functionality for setting up fetch request to DOL API
import 'dotenv/config';

// typescript interface for the expected response from dol API get request
interface DOLResponse {
  data: Array<{
    activity_nr: string;
    reporting_id: string;
    estab_name: string;
    site_city: string;
    site_state: string;
    safety_hlth: string;
    naics_code: string;
    insp_type: string;
    union_status: string;
    open_date: string;
  }>;
}

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
      value: dateString,
    },
  ],
};

//object to hold all the search params to pass in to fetch request
const params = new URLSearchParams({
  "X-API-KEY": process.env.DOL_API_KEY!,
  limit: "200",
  offset: "0",
  fields:
    "activity_nr,reporting_id,estab_name,site_city,site_state,safety_hlth,naics_code,insp_type,union_status,open_date",
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
