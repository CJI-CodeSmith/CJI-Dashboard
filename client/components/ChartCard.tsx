import React from "react";

interface ChartCardProps {
  title: string;
  description: string;
  dataWrapperLink: string;
}

export default function ChartCard({
  title,
  description,
  dataWrapperLink,
}: ChartCardProps) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <iframe src={dataWrapperLink} title={title}></iframe>
    </div>
  );
}
