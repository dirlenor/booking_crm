import { cn } from "@/lib/utils";

interface PackageQuotaDisplayProps {
  current: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function PackageQuotaDisplay({ 
  current, 
  max, 
  className,
  showLabel = true 
}: PackageQuotaDisplayProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isFull = current >= max;
  const isNearFull = !isFull && percentage >= 80;

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Availability</span>
          <span className={cn("font-medium", {
            "text-red-600": isFull,
            "text-amber-600": isNearFull,
            "text-green-600": !isFull && !isNearFull
          })}>
            {current} / {max}
          </span>
        </div>
      )}
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-300 rounded-full", {
            "bg-red-500": isFull,
            "bg-amber-500": isNearFull,
            "bg-green-500": !isFull && !isNearFull
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
