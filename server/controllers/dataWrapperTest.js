"use strict";
// import buildDatawrapperChart from './dataWrapperController';
const API_KEY = 'Rg5hae0GdNknh56zUDtRMQvVBopnyWIfXXbThl9NlLM0AeXfMXe0HpD6ON1j5ctb';
const BASE_URL = `https://api.datawrapper.de/v3`;
async function buildDatawrapperChart(title, csvString) {
    try {
        // 1. Create the chart
        //whose API key are we using for prod? will Avalon have her own?
        const createRes = await fetch(`${BASE_URL}/charts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, type: 'd3-bars' }), //here is where the different chart types come into place
        });
        console.log('made it to createRes');
        // Check if the response is actually okay
        if (!createRes.ok) {
            const errorText = await createRes.text();
            console.log('res not okay');
            throw new Error(`Create failed: ${errorText}`);
        }
        const chartData = (await createRes.json());
        // Check if ID exists before continuing
        if (!chartData.id) {
            throw new Error('Chart created but no ID returned from Datawrapper.');
        }
        const chartId = chartData.id;
        console.log(`Chart created with ID: ${chartId}`);
        // 2. Upload the CSV
        const uploadRes = await fetch(`${BASE_URL}/charts/${chartId}/data`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'text/csv',
            },
            body: csvString,
        });
        if (!uploadRes.ok)
            throw new Error('Upload failed');
        console.log('Data uploaded successfully.');
        // 3. Publish
        const publishRes = await fetch(`${BASE_URL}/charts/${chartId}/publish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${API_KEY}` },
        });
        const publishData = (await publishRes.json());
        // Note: Datawrapper v3 often uses 'publicUrl' or 'url' depending on the state
        const finalUrl = publishData.publicUrl || publishData.url;
        console.log(`Chart is live at: ${finalUrl}`);
        return finalUrl;
    }
    catch (error) {
        console.error('Process stopped:', error);
    }
}
// const myCsvData = `Year,Score
// 2024,85
// 2025,92
// 2026,100`;
const myCsvData = `
estab_name,site_city,site_state,open_date,insp_type,safety_hlth,union_status,naics_code ACCESS INFORMATION MANAGEMENT INC.,SALT LAKE CITY,UT,2022-04-08,Complaint,S,B,518210,,,K,Programmed Other`;
// "ALLEVITY, INC.",CHICO,CA,2026-03-04,Complaint,H,B,518210,,,L,Other
// AMAZON,NORTH JACKSON,OH,2022-02-14,Complaint,S,B,518210,,,M,Fatality - Catastrophe
// AMAZON,PRUDHOE BAY,AK,2023-10-11,Complaint,S,B,518210,,,N,Unprogrammed Emphasis
// Call the function
// buildDatawrapperChart('My Progress Report', myCsvData);
buildDatawrapperChart('Attempting bars', myCsvData);
