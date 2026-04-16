// Fetches data from the Data Wrapper API and returns it for use by the dashboard
import 'dotenv/config';
const API_KEY =
  'Rg5hae0GdNknh56zUDtRMQvVBopnyWIfXXbThl9NlLM0AeXfMXe0HpD6ON1j5ctb';

const BASE_URL = `https://api.datawrapper.de/v3/charts`;
async function getChart() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(
        "Issue getting response from dataWrapperController's getChart",
      );
    }
  } catch (err) {
    console.error(err);
  }
}



export default buildDatawrapperChart;
