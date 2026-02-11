import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock } from "lucide-react"
import { Trip } from "@/lib/mock-data/dashboard"

interface UpcomingTripsProps {
  trips: Trip[]
}

export function UpcomingTrips({ trips }: UpcomingTripsProps) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Upcoming Trips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trips.map((trip) => (
            <div key={trip.id} className="flex items-start gap-4">
              {(() => {
                const [datePart, timePart = ""] = trip.date.split(", ")
                const [month = "", day = ""] = datePart.split(" ")

                return (
                  <>
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-xs font-bold leading-none text-primary">
                      <span className="mb-1">{month}</span>
                      <span>{day}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{trip.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{timePart}</span>
                        <span className="mx-1">•</span>
                        <Users className="size-3" />
                        <span>
                          {trip.participants}/{trip.maxParticipants} pax
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Guide:</span> {trip.guide}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
