import Link from "next/link"
import { ArrowRight, Plane, Ticket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTours } from "@/lib/supabase/tours"
import { getLatestTicketTypes } from "@/lib/supabase/ticket-types"

function tourStatusClass(status: string): string {
  if (status === "published") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
  if (status === "pending_review") return "bg-amber-100 text-amber-700 hover:bg-amber-100"
  if (status === "archived") return "bg-slate-100 text-slate-700 hover:bg-slate-100"
  return "bg-blue-100 text-blue-700 hover:bg-blue-100"
}

export default async function ProductsHubPage() {
  const [tourRes, ticketRes] = await Promise.all([
    getTours({ page: 1, limit: 300 }),
    getLatestTicketTypes(10),
  ])

  const tours = tourRes.data
  const latestTours = tours.slice(0, 5)
  const tourNameMap = new Map(tours.map((tour) => [tour.id, tour.name]))
  const latestTickets = (ticketRes.data ?? []).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Products Overview</h1>
          <p className="text-muted-foreground">Latest tours and ticket types, plus a unified trip calendar.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/tours">
              <Plane className="h-4 w-4" />
              Open Tours
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/tickets">
              <Ticket className="h-4 w-4" />
              Open Tickets
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-input/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  Latest Tours
                </CardTitle>
                 <CardDescription>Last 5 created tours</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link href="/tours">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestTours.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No tours yet</TableCell>
                  </TableRow>
                ) : latestTours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>
                      <div className="font-medium text-foreground line-clamp-1">{tour.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{tour.destination}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tourStatusClass(tour.status)}>{tour.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{tour.duration_days} day(s)</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-input/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Latest Tickets
                </CardTitle>
                 <CardDescription>Last 5 created ticket types</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link href="/tickets">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No tickets yet</TableCell>
                  </TableRow>
                ) : latestTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="font-medium text-foreground line-clamp-1">{ticket.name}</div>
                      <div className="text-xs text-muted-foreground">{ticket.code}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground line-clamp-1">{tourNameMap.get(ticket.tour_id) ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={ticket.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
                        {ticket.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
