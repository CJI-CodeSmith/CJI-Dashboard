import React from "react";

interface StatCardProps {
  title: string;
  statistic: number | string;
}

export default function StatCard({ title, statistic }: StatCardProps) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p>{statistic}</p>
    </div>
  );
}