import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Users, CreditCard, Calendar, Activity, TrendingUp, TrendingDown } from "lucide-react"
import { SummaryStat } from "@/lib/mock-data/dashboard"

interface SummaryCardProps {
  stat: SummaryStat
}

const iconMap = {
  users: Users,
  "credit-card": CreditCard,
  calendar: Calendar,
  activity: Activity,
}

export function SummaryCard({ stat }: SummaryCardProps) {
  const Icon = iconMap[stat.icon]
  const isPositive = stat.trend > 0

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.label}
        </CardTitle>
        <div className={cn("p-2 rounded-full", "bg-primary/10 text-primary")}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="flex items-center text-xs mt-1">
          <span
            className={cn(
              "flex items-center font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositive ? (
              <TrendingUp className="mr-1 size-3" />
            ) : (
              <TrendingDown className="mr-1 size-3" />
            )}
            {Math.abs(stat.trend)}%
          </span>
          <span className="text-muted-foreground ml-1">{stat.trendLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}
