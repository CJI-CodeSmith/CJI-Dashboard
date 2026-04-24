import type { ReactNode } from "react";

interface StatRowProps {
  children: ReactNode;
}

export default function StatRow({ children }: StatRowProps) {
  return <div className="stat-row">{children}</div>;
}
