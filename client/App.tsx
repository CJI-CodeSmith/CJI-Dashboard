import { useQuery } from "@tanstack/react-query";
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

async function fetchCharts(): Promise<ChartsInfo> {
  const response = await fetch('/api/datawrapper/chart-info');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: ChartsInfo = await response.json();
  return data;
}

export default function App() {
  const {
    data: chartsInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["charts"],
    queryFn: fetchCharts,
    retry: 5,
    retryDelay: 3000,
  });

  const chartDescriptions = [
    " This analysis compares OSHA inspections to identify safety trends between organized and non-organized workplaces.",
    " This analysis compares OSHA inspections to identify differences between health trends and safety trends.",
    "This analysis compares various OSHA inspection types, including Complaint, Unprogrammed Related, Accident, Referral, Fatality/Catastrophe, Follow-Up, and Programmed inspections.",
  ];

  if (!chartsInfo)
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );

  if (error)
    return (
      <div>Error loading data. Check if the server is running.</div>
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
          <StatCard title="Data acquisition date" statistic="January 1, 2021" />
          <StatCard
            title="Total Inspections"
            statistic={chartsInfo.totalRecords}
          />
        </StatRow>
        <ChartRow>
          {chartsInfo.charts.slice(0, 2).map((chart, i) => (
            <ChartCard
              key={chart.chartID}
              description={chartDescriptions[i] || "Description not available."}
              dataWrapperiFrame={chart.embedCode}
            />
          ))}
        </ChartRow>
        <ChartRow>
          {chartsInfo.charts.slice(2).map((chart, i) => (
            <ChartCard
              key={chart.chartID}
              description={chartDescriptions[i + 2] || "Description not available."}
              dataWrapperiFrame={chart.embedCode}
            />
          ))}
        </ChartRow>
      </main>
      <Footer />
    </div>
  );
}
