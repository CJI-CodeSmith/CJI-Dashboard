// import buildDatawrapperChart from './dataWrapperController.js';
import 'dotenv/config';
// const DWAPI_KEY = process.env.DWAPI_KEY;
const DWAPI_KEY = '';
const BASE_URL = `https://api.datawrapper.de/v3`;
async function buildDatawrapperChart(title, csvString, chartType = 'd3-bars') {
    try {
        // 1. Create the chart
        //whose API key are we using for prod? will Avalon have her own?
        const createRes = await fetch(`${BASE_URL}/charts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DWAPI_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, type: `${chartType}` }), //here is where the different chart types come into place
        });
        console.log('made it to createRes');
        // Check if the response is actually okay
        if (!createRes.ok) {
            const errorText = await createRes.text();
            console.log('res not okay');
            throw new Error(`Create failed: ${errorText}`);
        }
        console.log('createRes: ', createRes);
        const chartData = (await createRes.json());
        // Check if ID exists before continuing
        if (!chartData.id) {
            throw new Error('Chart created but no ID returned from Datawrapper.');
        }
        console.log('CHART DATA ', chartData);
        const chartId = chartData.id;
        console.log(`Chart created with ID: ${chartId}`);
        // 2. Upload the CSV
        const uploadRes = await fetch(`${BASE_URL}/charts/${chartId}/data`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${DWAPI_KEY}`,
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
            headers: { Authorization: `Bearer ${DWAPI_KEY}` },
        });
        const publishData = (await publishRes.json());
        console.log('PUBLISH DATA ', publishData);
        // Note: Datawrapper v3 often uses 'publicUrl' or 'url' depending on the state
        const finalUrl = publishData.publicUrl || publishData.url;
        console.log(`Chart is live at: ${finalUrl}`);
        return finalUrl;
    }
    catch (error) {
        console.error('Process stopped:', error);
    }
}
//TODO add /data chart metadata
async function getChart(id) {
    try {
        const getChartResponse = await fetch(`${BASE_URL}/charts/${id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${DWAPI_KEY}`, accept: '*/*' },
        });
        if (!getChartResponse.ok) {
            throw new Error("Issue getting response from dataWrapperController's getChart");
        }
        const data = await getChartResponse.json();
        console.log('GETCHART RESPONSE ', getChartResponse);
        // 1. Get the direct link to the interactive chart
        const publicUrl = data.publicUrl;
        // 2. Get the PNG/Image version (handy for Slack/Emails)
        const imageUrl = `https://datawrapper.dwcdn.net/${id}/full.png`;
        console.log('--- CHART FOUND ---');
        console.log('Interactive Link:', publicUrl);
        console.log('Static Image:', imageUrl);
        return publicUrl;
    }
    catch (err) {
        console.error(err);
    }
}
/**FROM GEMINI
 * UPDATED: PATCH/PUT function to modify an existing chart
 * @param id - The chart ID (e.g., 'CeZ9e')
 * @param updates - Object containing metadata updates (title, theme, etc.)
 * @param newCsvString - Optional new CSV data to upload
 */
async function updateChart(id, updates, newCsvString) {
    try {
        // 1. PATCH the metadata (Title, Chart Type, etc.)
        const patchRes = await fetch(`${BASE_URL}/charts/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${DWAPI_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        if (!patchRes.ok)
            throw new Error(`Metadata update failed: ${await patchRes.text()}`);
        console.log('Metadata updated successfully.');
        // 2. PUT the new data (Only if provided)
        if (newCsvString) {
            const uploadRes = await fetch(`${BASE_URL}/charts/${id}/data`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${DWAPI_KEY}`,
                    'Content-Type': 'text/csv',
                },
                body: newCsvString,
            });
            if (!uploadRes.ok)
                throw new Error('Data upload failed');
            console.log('New data uploaded successfully.');
        }
        // 3. RE-PUBLISH (Mandatory to see changes live!)
        const publishRes = await fetch(`${BASE_URL}/charts/${id}/publish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${DWAPI_KEY}` },
        });
        if (!publishRes.ok)
            throw new Error('Re-publish failed');
        const publishData = await publishRes.json();
        // FALLBACK LOGIC: If publicUrl is missing in the publish response,
        // we use the standard CDN pattern or get it from the chart object.
        const finalUrl = publishData.publicUrl || `https://datawrapper.dwcdn.net/${id}/`;
        console.log(`Update Live! View here: ${finalUrl}`);
        return finalUrl;
    }
    catch (error) {
        console.error('Update stopped:', error);
    }
}
const myCsvData = `Year,Score
2024,85
2025,92
2026,100, 80`;
// Call the function
buildDatawrapperChart('My Progress Report', myCsvData, 'd3-donuts');
// buildDatawrapperChart('Attempting bars', myCsvData);
// getChart(`bHAkz`);
// --- EXAMPLE USAGE ---
// updateChart(
//   'bHAkz',
//   { title: 'Updated Progress Report' },
//   `Year,Score\n2024,90\n2025,95\n2026,110`,
// );
//Changing chart's title, type, or theme = changing the metadata
//Updating the chart means the number at the end increments, so it's best to exclude the link with '/1/' in it.
