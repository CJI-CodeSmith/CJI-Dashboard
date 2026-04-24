import { useState, useEffect } from "react";
import StatCard from "./components/StatCard";
import StatRow from "./components/StatRow";
import ChartCard from "./components/ChartCard";
import ChartRow from "./components/ChartRow";
import Footer from "./components/Footer";
import Header from "./components/Header";
import summaryData from "../server/data/Json/summaryData.json";

export default function App() {
  const [chartPublishedAtTime, setPublishedAtTime] = useState<string>("");
  const [chart1, setChart1] = useState<string>("");
  const [chart2, setChart2] = useState<string>("");
  const [chart3, setChart3] = useState<string>("");
  const mockDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sagittis metus id magna hendrerit aliquet. Vivamus sed nisl vel magna iaculis aliquet id quis neque. Sed vehicula, elit vel aliquam consectetur, augue ligula sagittis augue, eget dapibus ligula sem molestie nulla. Nullam aliquet nec est nec aliquet. Suspendisse tempus turpis et enim ultrices, at fermentum nisl laoreet. Quisque pretium ipsum velit, vel dictum lorem commodo in. Integer et arcu nec elit tincidunt finibus varius sed ipsum. Morbi mollis mauris vel dolor porttitor ultrices. Aenean erat velit, molestie quis sem in, mattis finibus mauris.";

  //implement a publishedAt diff from the response body in the backend to determine a rerender
  useEffect(() => {
    const fetchChart1 =
      '<iframe title="Union vs. Non-Union Inspections" aria-label="Pie Chart" id="datawrapper-chart-if71x" src="https://datawrapper.dwcdn.net/if71x/4/" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="440" data-external="1"></iframe><script type="text/javascript">window.addEventListener("message",function(a){if(void 0!==a.data["datawrapper-height"]){var e=document.querySelectorAll("iframe");for(var t in a.data["datawrapper-height"])for(var r,i=0;r=e[i];i++)if(r.contentWindow===a.source){var d=a.data["datawrapper-height"][t]+"px";r.style.height=d}}});</script>';
    const fetchChart2 =
      '<iframe title="Union vs. Non-Union Inspections" aria-label="Pie Chart" id="datawrapper-chart-if71x" src="https://datawrapper.dwcdn.net/if71x/4/" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="440" data-external="1"></iframe><script type="text/javascript">window.addEventListener("message",function(a){if(void 0!==a.data["datawrapper-height"]){var e=document.querySelectorAll("iframe");for(var t in a.data["datawrapper-height"])for(var r,i=0;r=e[i];i++)if(r.contentWindow===a.source){var d=a.data["datawrapper-height"][t]+"px";r.style.height=d}}});</script>';
    const fetchChart3 =
      '<iframe title="Union vs. Non-Union Inspections" aria-label="Pie Chart" id="datawrapper-chart-if71x" src="https://datawrapper.dwcdn.net/if71x/4/" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="820" data-external="1"></iframe><script type="text/javascript">window.addEventListener("message",function(a){if(void 0!==a.data["datawrapper-height"]){var e=document.querySelectorAll("iframe");for(var t in a.data["datawrapper-height"])for(var r,i=0;r=e[i];i++)if(r.contentWindow===a.source){var d=a.data["datawrapper-height"][t]+"px";r.style.height=d}}});</script>';

    const lastPublishedAtTime = "2024-06-01T12:00:00Z";
    const date = new Date(lastPublishedAtTime).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setPublishedAtTime(date);
    setChart1(fetchChart1);
    setChart2(fetchChart2);
    setChart3(fetchChart3);
  }, [chartPublishedAtTime]);

  return (
    <div className="app">
      <Header publishedAt={chartPublishedAtTime} />
      <main className="main">
        <StatRow>
          <StatCard
            title="Total Inspections"
            statistic={summaryData.totalRecords}
          />
          {/* Remove safety inspection and Health Inspection cards, replace with a more detailed breakdown per chart */}
          <StatCard
            title="Safety Inspections"
            statistic={summaryData.InspFocus.Safety}
          />
          <StatCard
            title="Health Inspections"
            statistic={summaryData.InspFocus.Health}
          />
        </StatRow>
        <ChartRow>
          <ChartCard description={mockDescription} dataWrapperiFrame={chart1} />
          <ChartCard description={mockDescription} dataWrapperiFrame={chart2} />
        </ChartRow>
        <ChartRow>
          <ChartCard description={mockDescription} dataWrapperiFrame={chart3} />
        </ChartRow>
      </main>
      <Footer />
    </div>
  );
}
