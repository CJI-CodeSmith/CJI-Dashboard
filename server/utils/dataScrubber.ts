// Utility functions for cleaning and normalizing raw API data before converting to CSV

/* NOTES RE TABLE/DATA KEYS
owner_type: A=Private. B=LocalGovt. C=StateGovt. D=Federal

safety_hlth: S=Safety. H=Health

insp_type: A=Accident. B=Complaint. C=Referral. D=Monitoring. E=Variance. F=FollowUp. G=Unprog Rel. H=Planned. I=Prog Related. J=Unprog Other. K=Prog Other. L=Other-L. M=Fat/Cat. N=Unprog Emph

union_status:  Y/U/A=Yes N/B/blank=No 

open_date: yyyy-mm-dd format
*/ 

import fs from "fs";
import path from "path";

// Define replacement for inspection type letter codes 
const inspTypes: Record<string, string> = {
    'A': 'Accident',
    'B': 'Referral',
    'C': 'Complaint',
    'D': 'Monitoring',
    'E': 'Variance',
    'F': 'Follow-Up',
    'H': 'Planned',
    'I': 'Programmed Related',
    'J': 'Unprogrammed Other'
};
// define replacement for owner_type letter codes
const ownerTypes: Record<string, string> ={
    'A': 'Private Sector',
    'B': 'Local Government',
    'C': 'State Government',
    'D': 'Federal Government'
}
// guard clause for establishment name, if field is empty, return unknown. 
const cleanEstabName = (rawName: string): string => {
    if (!rawName) return 'Unknown';
    return rawName
    .replace(/^\w+\s*-\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
};
    //https://regexr.com/ Pasted establishment names and used references to create regex that starts at the beginning (^) and finds any digits, any spaces (\s*), and a hyphen (-) and any spaces after the hyphen and replaces it with an empty space. 
// Void used because nothing is returned from the function, we write a new file instead. 
export const scrubData = (): void => {
    // rawFilePath = input file
    // cleanedFilePath = output file
    const rawFilePath = path.join(__dirname, "../data/rawData.json")
    const cleanedFilePath = path.join(__dirname, "../data/cleanedData.json");

    console.log("Data scrubbing started...");
    // guard clause for if input file is not detected
    if (!fs.existsSync(rawFilePath)) {
        console.log("No raw data found for scrubbing")
        return;
    }
    // rawData = reading raw datafile - utf-8 turns it into a string.
    // records = parsing the string into an array of objects so we can map through it.
    const rawData = fs.readFileSync(rawFilePath, "utf-8");
    const records = JSON.parse(rawData);

    // map through the array of objects
const cleanedRecords = records.map((row: any) => {
    // we invoke cleanEstabName passing in the row.estab_name. This invokes the function on 31 & 32 and returns the trimmed and cleaned establishment name.
    const establishmentName = cleanEstabName(row.estab_name);
    // We use inspTypes object as a Key-Value pair, when we pass in the row.insp_type letter code, it finds the key and gets the value which is the full inspection name. Do the same for ownership.
    const InspectionType = inspTypes[row.insp_type]; 
    const ownership = ownerTypes[row.owner_type];

    // Split the open_date into an array with 2 elements at "T" and take just the date.
    const formatDate =  row.open_date ? row.open_date.split("T")[0] : '';

    // ternary operators replace safety_hlth and union codes with full words. Syntax demanded a final else statement so if it finds any letter code it doesnt expect, we return unknown.
    const safetyFocus = row.safety_hlth === 'S' ? 'Safety' : row.safety_hlth === "H" ? 'Health' : "Unknown";
    const unionStatus =  row.union_status === 'A' ? 'Union' : row.union_status === "B" ? "Non-Union" : "Unknown";



    // we return a new object with the cleaned and normalized data with readable keys and our cleaned values. Because we mapped through the original array, we get a new array of cleaned objects without affecting the original fetch.
    return {
        "Establishment": establishmentName,
            "Address": row.site_address,
            "City": row.site_city,
            "State": row.site_state,
            "Zip Code": row.site_zip,
            "Business Ownership": ownership,
            "Inspection Focus": safetyFocus,
            "NAICS Code": row.naics_code,
            "Inspection Purpose": InspectionType,
            "Unionized": unionStatus,
            "Employee Count": row.nr_in_estab,
            "Inspection Start Date": formatDate
    }
})
// We write our cleaned data to its file path.
  fs.writeFileSync(cleanedFilePath, JSON.stringify(cleanedRecords, null, 2));
    console.log("Data scrubbing completed. Cleaned data has been written into cleanedData.json");
};
