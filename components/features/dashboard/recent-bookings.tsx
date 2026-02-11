import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Booking } from "@/lib/mock-data/dashboard"
import Link from "next/link"

interface RecentBookingsProps {
  bookings: Booking[]
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  pending: "secondary",
  completed: "outline",
  cancelled: "destructive",
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card className="col-span-1 lg:col-span-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest transactions from your customers.</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/bookings">
            View All <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Customer</TableHead>
              <TableHead className="hidden sm:table-cell w-[36%] whitespace-normal">Package</TableHead>
              <TableHead className="hidden md:table-cell w-[14%]">Date</TableHead>
              <TableHead className="w-[12%] whitespace-nowrap">Status</TableHead>
              <TableHead className="text-right w-[10%] whitespace-nowrap">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="border-b last:border-0">
                <TableCell className="py-3 font-medium">
                  <div className="flex flex-col">
                    <span>{booking.customerName}</span>
                    <span className="text-xs text-muted-foreground sm:hidden">{booking.id}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell py-3 whitespace-normal break-words">
                  {booking.packageName}
                </TableCell>
                <TableCell className="hidden md:table-cell py-3 text-muted-foreground whitespace-nowrap tabular-nums">
                  {booking.date}
                </TableCell>
                <TableCell className="py-3 whitespace-nowrap">
                  <Badge variant={statusVariantMap[booking.status] || "default"} className="capitalize">
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-right whitespace-nowrap tabular-nums">
                  ฿{booking.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
