interface StatCardProps {
  title: string;
  statistic: number | string;
}

export default function StatCard({ title, statistic }: StatCardProps) {
  return (
    <div className="stat-card">
      <h3 className="stat-card-title">{title}</h3>
      <p className="stat-card-stat">{statistic}</p>
    </div>
  );
}
