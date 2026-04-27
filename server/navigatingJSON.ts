import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getChartsInfo() {
  const chartsInfoPath = path.join(__dirname, '/chartsInfo.json');
  try {
    const info = await fs.promises.readFile(chartsInfoPath, 'utf-8');
    const data = JSON.parse(info);
    console.log('DATA: ', data);
    // console.log(data.charts[0]['chartID']);
    for (let i = 0; i < data.charts.length; i++) {
      console.log(data.charts[i]['chartID']);
    }
  } catch (err) {
    console.error('error at reading', err);
  }
}
getChartsInfo();
