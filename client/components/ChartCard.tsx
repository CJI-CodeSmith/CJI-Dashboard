interface ChartCardProps {
  description: string;
  dataWrapperiFrame: string;
}

export default function ChartCard({
  description,
  dataWrapperiFrame,
}: ChartCardProps) {
  return (
    <div className="chart-card">
      <div
        className="chart-card-embed"
        dangerouslySetInnerHTML={{ __html: dataWrapperiFrame }}
      />
      <p className="chart-card-description">{description}</p>
    </div>
  );
}
