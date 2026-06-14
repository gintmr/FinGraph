import { cn } from "@/lib/utils/cn";

export function Sparkline({
  values,
  color = "#5b9dff",
  className
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const width = 96;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? width : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className={cn("h-7 w-24", className)} viewBox={`0 0 ${width} ${height}`} role="img">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

