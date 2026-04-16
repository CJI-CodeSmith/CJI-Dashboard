// Fetches data from the Data Wrapper API and returns it for use by the dashboard
import 'dotenv/config';
const API_KEY = 'Rg5hae0GdNknh56zUDtRMQvVBopnyWIfXXbThl9NlLM0AeXfMXe0HpD6ON1j5ctb';
const BASE_URL = `https://api.datawrapper.de/v3/charts`;
async function getChart() {
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) {
            throw new Error("Issue getting response from dataWrapperController's getChart");
        }
    }
    catch (err) {
        console.error(err);
    }
}
//From gemini
async function buildDatawrapperChart(title, csvString) {
    try {
        // STEP 1: Create the chart "Frame"
        const createRes = await fetch(`${BASE_URL}/charts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                type: 'd3-lines' // You can change this to 'd3-bars', 'tables', etc.
            })
        });
        const chart = await createRes.json();
        const chartId = chart.id;
        console.log(`Chart created with ID: ${chartId}`);
        // STEP 2: Upload the "Furniture" (CSV Data)
        // Teacher Note: We send the CSV as plain text, NOT JSON.
        await fetch(`${BASE_URL}/charts/${chartId}/data`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'text/csv'
            },
            body: csvString
        });
        console.log('Data uploaded successfully.');
        // STEP 3: Turn on the "Lights" (Publish)
        const publishRes = await fetch(`${BASE_URL}/charts/${chartId}/publish`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const publishData = await publishRes.json();
        console.log(`Chart is live at: ${publishData.url}`);
        return publishData.url;
    }
    catch (error) {
        console.error('Failed to create chart:', error);
    }
}
export default buildDatawrapperChart;
