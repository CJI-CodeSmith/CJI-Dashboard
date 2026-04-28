import { useState, useEffect } from "react";
import StatCard from "./components/StatCard";
import StatRow from "./components/StatRow";
import ChartCard from "./components/ChartCard";
import ChartRow from "./components/ChartRow";
import Footer from "./components/Footer";
import Header from "./components/Header";

interface Chart {
  chartName: string;
  chartID: string;
  embedCode: string;
  publishedDate: string;
  chartType: string;
}

interface ChartsInfo {
  latestFetchDate: number | string;
  totalRecords: number;
  charts: Chart[];
}

export default function App() {
  const [chartsInfo, setChartsInfo] = useState<ChartsInfo | null>(null);
  const mockDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sagittis metus id magna hendrerit aliquet. Vivamus sed nisl vel magna iaculis aliquet id quis neque. Sed vehicula, elit vel aliquam consectetur, augue ligula sagittis augue, eget dapibus ligula sem molestie nulla. Nullam aliquet nec est nec aliquet. Suspendisse tempus turpis et enim ultrices, at fermentum nisl laoreet. Quisque pretium ipsum velit, vel dictum lorem commodo in. Integer et arcu nec elit tincidunt finibus varius sed ipsum. Morbi mollis mauris vel dolor porttitor ultrices. Aenean erat velit, molestie quis sem in, mattis finibus mauris.";

  useEffect(() => {
    const SERVER_PORT = 8888;
    const fetchCharts = async () => {
      try {
        const response = await fetch(
          `http://localhost:${SERVER_PORT}/api/datawrapper/chart-info`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ChartsInfo = await response.json();
        setChartsInfo(data);
      } catch (error) {
        console.error("Error fetching charts info:", error);
      }
    };
    fetchCharts();
  }, []);

  if (!chartsInfo)
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );

  const latestFetch = new Date(chartsInfo.latestFetchDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="app">
      <Header lastUpdated={latestFetch} />
      <main className="main">
        <StatRow>
          <StatCard
            title="Total Inspections"
            statistic={chartsInfo.totalRecords}
          />
        </StatRow>
        <ChartRow>
          {chartsInfo.charts.slice(0, 2).map((chart) => (
            <ChartCard
              key={chart.chartID}
              description={mockDescription}
              dataWrapperiFrame={chart.embedCode}
            />
          ))}
        </ChartRow>
        <ChartRow>
          {chartsInfo.charts.slice(2).map((chart) => (
            <ChartCard
              key={chart.chartID}
              description={mockDescription}
              dataWrapperiFrame={chart.embedCode}
            />
          ))}
        </ChartRow>
      </main>
      <Footer />
    </div>
  );
}
