// Fetches data from the Data Wrapper API and returns it for use by the dashboard
// TODO: import express and convert functions into express route handlers  - for each function params must be:( req: Request, res: Response) and the currently passed in params have to be pulled from req.params or req.body, then return res.status(200).json(...) instead of returning the actual values
import { Request, Response } from 'express';

//TODO: all catch blocks should call res.status(500).json({ error plus whatever info })
import 'dotenv/config';
const DWAPI_KEY = process.env.DWAPI_KEY;

const BASE_URL = `https://api.datawrapper.de/v3`;

//TODO: export buildDatawrapperChart function so it can be imported to routes
export async function buildDatawrapperChart(title: string, csvData: string | any) {
  //Whose API key are we using for the client? Will there be one for Cornell?
  //charts endpoint for creating
  try {
    const createRes = await fetch(`${BASE_URL}/charts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DWAPI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, type: 'd3-bars' }), //here is where the different chart types come into play, our donuts etc
      //! save the chart type above to a variable so this function is reusable for different charts?
    });
    //Checking if the response is successful
    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.log('createRes not okay');
      throw new Error(`Create failed: ${errorText}`);
    }
    const chartData = await createRes.json();
    const chartId = chartData.id;
    console.log(`Created chart with ID#: ${chartId}`);

    //UPLOADING THE CSV DATA
    const uploadRes = await fetch(`${BASE_URL}/charts/${chartId}/data`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${DWAPI_KEY}`,
        'Content-Type': 'text/csv',
      },
      body: csvData,
    });

    if (!uploadRes.ok) throw new Error('Upload failed');
    console.log('Data uploaded successfully.');

    //PUBLISHING THE NEW CHART because we need to publish in order to see the adjusted data
    const publishRes = await fetch(`${BASE_URL}/charts/${chartId}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${DWAPI_KEY}` },
    });

    const publishData = await publishRes.json();
    const url: string = publishData.url;
    const publicUrl: string = publishData.publicUrl;

    //Datawrapper can use publicUrl or url depending on the state, so we use finalUrl to catch both
    const finalUrl = publishData.publicUrl || publishData.url;

    console.log(`Chart is live at: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    console.error('Process stopped: ', error);
  }
}

//TODO: export getChart to be used in routes
export async function getChart(id: string) {
  try {
    const getChartResponse = await fetch(`${BASE_URL}/charts/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DWAPI_KEY}`,
        accept: '*/*',
      },
    });

    if (!getChartResponse.ok) {
      throw new Error(
        "Issue getting response from dataWrapperController's getChart",
      );
    }
    const data = await getChartResponse.json();

    const publicUrl = data.publicUrl; //clickable for public access
    const imageUrl = `https://datawrapper.dwcdn.net/${id}/full.png`; //static image
  } catch (error) {
    console.error('Error in getChartResponse in dataWrapperController');
  }
}

//TODO: export updateChart to be used in routes
export async function updateChart(id: string, updates: object, newCsvData?: string) {
  try {
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

    //inputting optional new data (this seems to replace previous data completely)
    if (newCsvData) {
      const uploadRes = await fetch(`${BASE_URL}/charts/${id}/data`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${DWAPI_KEY}`,
          'Content-Type': 'text/csv',
        },
        body: newCsvData,
      });
      if (!uploadRes.ok) throw new Error('Data upload failed');
      console.log('New data uploaded successfully.');
    }

    //Need to republish for public API viewing

    const publishRes = await fetch(`${BASE_URL}/charts/${id}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${DWAPI_KEY}` },
    });

    if (!publishRes.ok) throw new Error('Re-publish failed');

    const publishData = await publishRes.json();
    const finalUrl =
      publishData.publicUrl || `https://datawrapper.dwcdn.net/${id}/`;

    console.log(`Update Live! View here: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    console.error('Error in updateChart in dataWrapperController');
  }
}
