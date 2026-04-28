// Utility functions for cleaning and normalizing raw API data before converting to CSV

/* NOTES RE TABLE/DATA KEYS
owner_type: A=Private. B=LocalGovt. C=StateGovt. D=Federal

safety_hlth: S=Safety. H=Health

insp_type: A=Accident. B=Complaint. C=Referral. D=Monitoring. E=Variance. F=FollowUp. G=Unprog Rel. H=Planned. I=Prog Related. J=Unprog Other. K=Prog Other. L=Other-L. M=Fat/Cat. N=Unprog Emph

union_status:  Y/U/A=Yes N/B/blank=No 

open_date: yyyy-mm-dd format
*/

import fs from 'fs';
import path from 'path';
import { json2csv } from 'json-2-csv';

//Dirname not defined because type module

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// [insp-exclusion] Letter codes listed here are dropped before scrubbing — see filter block in scrubData()
const EXCLUDED_INSP_TYPES: ReadonlySet<string> = new Set(['H']);

// Define replacement for inspection type letter codes
const inspTypes: Record<string, string> = {
  A: 'Accident',
  B: 'Complaint',
  C: 'Referral',
  D: 'Monitoring',
  E: 'Variance',
  F: 'Follow-Up',
  G: 'Unprogrammed Related',
  H: 'Planned',
  I: 'Programmed Related',
  J: 'Unprogrammed Other',
  K: 'Programmed Other',
  L: 'Other',
  M: 'Fatality/Catastrophe',
  N: 'Unprogrammed Emphasis',
};
// define replacement for owner_type letter codes
const ownerTypes: Record<string, string> = {
  A: 'Private Sector',
  B: 'Local Government',
  C: 'State Government',
  D: 'Federal Government',
};
// guard clause for establishment name, if field is empty, return unknown.
const cleanEstabName = (rawName: string): string => {
  if (!rawName) return 'Unknown';
  return rawName
    .replace(/^\w+\s*-\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const scrubData = (): { totalRecords: number } => {
  // JSON paths

  const rawFilePath = path.join(__dirname, '../data/Json/rawData.json');
  const cleanedFilePath = path.join(__dirname, '../data/Json/cleanedData.json');
  const summaryFilePath = path.join(__dirname, '../data/Json/summaryData.json');

  // CSV paths

  const csvFilePath = path.join(__dirname, '../data/general_csv/csvData.csv');
  const summaryCsvFilePath = path.join(
    __dirname,
    '../data/general_csv/stats.csv',
  );

  //Visualization paths

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

  console.log('Data scrubbing started...');
  // guard clause for if input file is not detected
  if (!fs.existsSync(rawFilePath)) {
    console.log('No raw data found for scrubbing');
    return { totalRecords: 0 };
  }
  // rawData = reading raw datafile - utf-8 turns it into a string.
  // records = parsing the string into an array of objects so we can map through it.
  const rawData = fs.readFileSync(rawFilePath, 'utf-8');
  // [insp-exclusion] Drop excluded insp_types before stats/cleanedRecords are built so totalRecords reflects retained set
  const parsed = JSON.parse(rawData);
  const records = parsed.filter(
    (row: any) => !EXCLUDED_INSP_TYPES.has(row.insp_type),
  );
  console.log(
    `Scrubbing ${records.length} of ${parsed.length} records ` +
      `(excluded ${parsed.length - records.length} by insp_type)`,
  );

  // a stats object to hold our summary data, set to 0 to increment while mapping.
  const stats = {
    totalRecords: records.length,
    unionStatus: { Union: 0, 'Non-Union': 0, Unknown: 0 },
    InspFocus: { Safety: 0, Health: 0, Unknown: 0 },
    // Empty object, when mapping. Inspection type letter code = key, we increment the value for our key in each iteration.
    inspectionTypes: {} as Record<string, number>,
  };

  // map through the array of objects
  const cleanedRecords = records.map((row: any) => {
    // we invoke cleanEstabName passing in the row.estab_name. This invokes the function on 31 & 32 and returns the trimmed and cleaned establishment name.
    const establishmentName = cleanEstabName(row.estab_name);
    // We use inspTypes object as a Key-Value pair, when we pass in the row.insp_type letter code, it finds the key and gets the value which is the full inspection name. Do the same for ownership.
    const InspectionType = inspTypes[row.insp_type];
    const ownership = ownerTypes[row.owner_type];

    // Split the open_date into an array with 2 elements at "T" and take just the date.
    const formatDate = row.open_date ? row.open_date.split('T')[0] : '';

    // safetyFocus found in this loop, as well as unionStatus are to be incremented into stats.
    const safetyFocus =
      row.safety_hlth === 'S'
        ? 'Safety'
        : row.safety_hlth === 'H'
          ? 'Health'
          : 'Unknown';
    const isUnion = ['Y', 'U', 'A'].includes(row.union_status);
    const isNonUnion = ['N', 'B', ''].includes(row.union_status);
    const unionStatus = isUnion
      ? 'Union'
      : isNonUnion
        ? 'Non-Union'
        : 'Unknown';

    // Concat address.
    const fullAddress = [
      row.site_address,
      row.site_city,
      row.site_state,
      row.site_zip,
    ].join(', ');

    // increment stats for summary data
    stats.InspFocus[safetyFocus]++;
    stats.unionStatus[unionStatus]++;
    // if inspection type doesnt exsist in stats object, incrementing = NaN. Our inspection type = null.
    // stats.inspectionTypes[InspectionType] = (stats.inspectionTypes[InspectionType] || 0) + 1;
    
    if (InspectionType) {
        stats.inspectionTypes[InspectionType] = (stats.inspectionTypes[InspectionType] || 0) + 1;
    } else {
        stats.inspectionTypes['Unknown'] = (stats.inspectionTypes['Unknown'] || 0) + 1;
    }

    // we return a new object with the cleaned and normalized data with readable keys and our cleaned values. Because we mapped through the original array, we get a new array of cleaned objects without affecting the original fetch.
    return {
      Establishment: establishmentName,
      'Full Address': fullAddress,
      'Business Ownership': ownership,
      'Inspection Focus': safetyFocus,
      'NAICS Code': row.naics_code,
      'Inspection Purpose': InspectionType,
      'Union Status': unionStatus,
      'Employee Count': row.nr_in_estab,
      'Inspection Start Date': formatDate,
    };
  });

  // Helper function to flatten the array for proper csv conversion
  const formatCsv = (dataObj: Record<string, any>, valueHeader: string) => {
    return Object.entries(dataObj).map(([name, count]) => {
        return {
            "Category": name,
            [valueHeader]: count
        }
    })
}

  // Converts counts to whole-number percentages so Datawrapper's "0%" label
  // format displays "42%" rather than appending % to the raw count.
  // Datawrapper does not multiply by 100 like D3's % format — it just rounds
  // and appends %, so values must already be in the 0–100 range.
  const formatCsvAsPercentages = (dataObj: Record<string, number>, valueHeader: string) => {
    const total = Object.values(dataObj).reduce((sum, val) => sum + val, 0);
    return Object.entries(dataObj).map(([name, count]) => ({
        "Category": name,
        [valueHeader]: total > 0 ? Math.round((count / total) * 100) : 0
    }));
}

// Flatten required objects

const unionData = formatCsvAsPercentages(stats.unionStatus, "Union Status")
const focusData = formatCsvAsPercentages(stats.InspFocus, "Inspection Focus")
const inspTypeData = formatCsvAsPercentages(stats.inspectionTypes, "Inspection Type")

const summaryStats = {
    "Total Records": stats.totalRecords,
    ...stats.unionStatus,
    ...stats.InspFocus,
    ...stats.inspectionTypes
}
const summaryData = formatCsv(summaryStats, "Count")

// Convert datasets to CSV

const mainCSV = json2csv(cleanedRecords)
const unionCSV = json2csv(unionData);
const focusCSV = json2csv(focusData);
const inspTypeCSV = json2csv(inspTypeData);
const summaryCSV = json2csv(summaryData);

// We write our cleaned data to its file path.

fs.writeFileSync(csvFilePath, mainCSV);
    console.log('Wrote to cleanedData.csv')
fs.writeFileSync(cleanedFilePath, JSON.stringify(cleanedRecords, null, 2));
    console.log('Wrote to cleanedData.json')
fs.writeFileSync(unionCsvPath, unionCSV);
    console.log('Wrote to unionStatus.csv')
fs.writeFileSync(inspFocusCsvPath, focusCSV);
    console.log('Wrote to inspFocus.csv')
fs.writeFileSync(inspTypeCsvPath, inspTypeCSV);
    console.log('Wrote to inspType.csv')
fs.writeFileSync(summaryCsvFilePath, summaryCSV);
    console.log('Wrote to stats.csv')
fs.writeFileSync(summaryFilePath, JSON.stringify(stats, null, 2));
    console.log('Wrote to summaryData.json')

    console.log("Data scrubbing Complete")

    // [insp-exclusion] Returned to fetchAndScrubData() so the API surfaces post-exclusion count, not raw fetch length
    return { totalRecords: records.length };
}

