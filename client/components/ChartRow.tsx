import { Children, ReactNode } from "react";

interface ChartRowProps {
  children: ReactNode;
}

export default function ChartRow({ children }: ChartRowProps) {
  const count = Children.count(children);
  const layoutClass = count <= 1 ? "chart-row-full" : "chart-row-split";
  return <div className={`chart-row ${layoutClass}`}>{children}</div>;
}
