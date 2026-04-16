// Fetches data from the Data Wrapper API and returns it for use by the dashboard
import 'dotenv/config';
const DWAPI_KEY = 'Rg5hae0GdNknh56zUDtRMQvVBopnyWIfXXbThl9NlLM0AeXfMXe0HpD6ON1j5ctb';
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
async function buildDatawrapperChart(title, csvString) {
    try {
        // 1. Create the chart
        //whose API key are we using for prod? will Avalon have her own?
        const createRes = await fetch(`${BASE_URL}/charts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DWAPI_KEY}`,
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
        console.log('createRes: ', createRes);
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
        // Note: Datawrapper v3 often uses 'publicUrl' or 'url' depending on the state
        const finalUrl = publishData.publicUrl || publishData.url;
        console.log(`Chart is live at: ${finalUrl}`);
        return finalUrl;
    }
    catch (error) {
        console.error('Process stopped:', error);
    }
}
export default buildDatawrapperChart;
