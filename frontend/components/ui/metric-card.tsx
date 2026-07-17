import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  className?: string;
}

export function MetricCard({ title, value, icon, description, className = "" }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {description && (
          <span className="text-xs text-gray-500 font-normal">{description}</span>
        )}
      </div>
    </div>
  );
}
