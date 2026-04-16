// Utility functions for converting JSON data to CSV format for upload to Data Wrapper

const testData = [
  {
    estab_name: "AMAZON DATA CENTER",
    site_address: "2570 BEECH ROAD NORTHWEST",
    site_city: "JOHNSTOWN",
    site_state: "OH",
    site_zip: "43031",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "B",
    union_status: "B",
    nr_in_estab: "20",
    open_date: "2021-02-24T00:00:00",
  },
  {
    estab_name: "AMAZON DATA SERVICES INC, IAD68",
    site_address: "42948 FRADELEY LN",
    site_city: "STERLING",
    site_state: "VA",
    site_zip: "20166",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "B",
    union_status: "B",
    nr_in_estab: "20",
    open_date: "2021-03-04T00:00:00",
  },
  {
    estab_name: "WA317963183 - CIOX HEALTH LLC",
    site_address: "TRIOS CARE CENTER 3730 PLAZA WAY",
    site_city: "KENNEWICK",
    site_state: "WA",
    site_zip: "99338",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "G",
    union_status: "B",
    nr_in_estab: "2",
    open_date: "2021-03-17T00:00:00",
  },
  {
    estab_name: "O'NEIL DIGITAL SOLUTIONS, LLC",
    site_address: "12655 BEATRICE STREET",
    site_city: "LOS ANGELES",
    site_state: "CA",
    site_zip: "90066",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "A",
    union_status: "B",
    nr_in_estab: "125",
    open_date: "2021-04-28T00:00:00",
  },
  {
    estab_name: "BIGBYTE.CC CORP.",
    site_address: "123 CENTRAL AVE. NW",
    site_city: "ALBUQUERQUE",
    site_state: "NM",
    site_zip: "87102",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "B",
    union_status: "B",
    nr_in_estab: "8",
    open_date: "2021-05-10T00:00:00",
  },
  {
    estab_name: "RUSSELL INDUSTRIAL CENTER",
    site_address: "1600 CLAY ST",
    site_city: "DETROIT",
    site_state: "MI",
    site_zip: "48211",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "G",
    union_status: "B",
    nr_in_estab: "10",
    open_date: "2021-06-18T00:00:00",
  },
  {
    estab_name: "AMAZON.COM SERVICES LLC",
    site_address: "13905 CRAYTON BOULEVARD",
    site_city: "HAGERSTOWN",
    site_state: "MD",
    site_zip: "21742",
    owner_type: "A",
    safety_hlth: "H",
    naics_code: "518210",
    insp_type: "C",
    union_status: "B",
    nr_in_estab: "632",
    open_date: "2021-07-27T00:00:00",
  },
  {
    estab_name: "WELLWOOD PLUMBING AND HEATING CO. INC.",
    site_address: "274 SOUTH FIRST ST.",
    site_city: "LINDENHURST",
    site_state: "NY",
    site_zip: "11757",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "C",
    union_status: "B",
    nr_in_estab: "11",
    open_date: "2021-09-02T00:00:00",
  },
  {
    estab_name: "META PLATFORMS, INC.",
    site_address: "1180 DISCOVERY WAY",
    site_city: "SUNNYVALE",
    site_state: "CA",
    site_zip: "94089",
    owner_type: "A",
    safety_hlth: "H",
    naics_code: "518210",
    insp_type: "G",
    union_status: "B",
    nr_in_estab: "50",
    open_date: "2021-11-03T00:00:00",
  },
  {
    estab_name: "NYSOITS",
    site_address: "EMPIRE STATE PLAZA, CORE 4, SWAN ST",
    site_city: "ALBANY",
    site_state: "NY",
    site_zip: "12226",
    owner_type: "C",
    safety_hlth: "H",
    naics_code: "518210",
    insp_type: "M",
    union_status: "A",
    nr_in_estab: "495",
    open_date: "2021-11-19T00:00:00",
  },
  {
    estab_name: "103780 - BIT 49 INC",
    site_address: "210 11TH STREET W",
    site_city: "GLENCOE",
    site_state: "MN",
    site_zip: "55336",
    owner_type: "A",
    safety_hlth: "H",
    naics_code: "518210",
    insp_type: "B",
    union_status: "B",
    nr_in_estab: "3",
    open_date: "2021-11-23T00:00:00",
  },
  {
    estab_name: "64507 - BRANDENBURG TELECOM LLC",
    site_address: "SALT RIVER RD.",
    site_city: "RINEYVILLE",
    site_state: "KY",
    site_zip: "40162",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "G",
    union_status: "B",
    nr_in_estab: "116",
    open_date: "2021-12-08T00:00:00",
  },
  {
    estab_name: "AMAZON",
    site_address: "12111 DEBARTOLO DRIVE",
    site_city: "NORTH JACKSON",
    site_state: "OH",
    site_zip: "44451",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "B",
    union_status: "B",
    nr_in_estab: "190",
    open_date: "2022-02-14T00:00:00",
  },
  {
    estab_name: "RX DATA 365",
    site_address: "445 CLINTON STREET",
    site_city: "CLINTON",
    site_state: "MO",
    site_zip: "64735",
    owner_type: "A",
    safety_hlth: "S",
    naics_code: "518210",
    insp_type: "B",
    union_status: "B",
    nr_in_estab: "1",
    open_date: "2022-02-16T00:00:00",
  },
];

function jsonToCsv(data: Record<string, unknown>[]) {
  if (!data || !data.length) return "";

  const headers = Object.keys(data[0]);

  const rows = data.map((row) =>
    headers
      .map((header) => {
        // if a value doesn't exist or is undefined, it returns an empty string
        let value = row[header] ?? "";

        // converts value to a string and escapes any double quote values - CSV format rule
        const escaped = ("" + value).replace(/"/g, '""');

        // wrap in double quotes if the value contains a comma, quote, or newline to keep CSV columns intact
        return escaped.includes(",") ||
          escaped.includes('"') ||
          escaped.includes("\n")
          ? `"${escaped}"`
          : escaped;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\r\n");
}

console.log(jsonToCsv(testData));
