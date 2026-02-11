import { Eye, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Booking } from "@/lib/mock-data/bookings";
import { BookingStatusBadge, PaymentStatusBadge } from "./booking-status-badge";
import Link from "next/link";

interface BookingRowProps {
  booking: Booking;
}

export function BookingRow({ booking }: BookingRowProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));
  };
  
  const formatShortDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(dateString));
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <Link 
            href={`/bookings/${booking.id}`}
            className="hover:underline hover:text-primary transition-colors font-semibold"
          >
            {booking.bookingRef}
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {formatDate(booking.bookingDate)}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold hidden md:flex">
            {booking.customer?.avatarInitials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{booking.customer?.name}</span>
            <span className="text-xs text-muted-foreground hidden lg:inline-block">
              {booking.customer?.email}
            </span>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col max-w-[200px]">
          <span className="truncate font-medium text-sm" title={booking.package?.name}>
            {booking.package?.name}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
               <Calendar className="h-3 w-3" />
               {formatShortDate(booking.tripDate)}
            </span>
            <span className="flex items-center gap-1">
               <User className="h-3 w-3" />
               {booking.pax}
            </span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <BookingStatusBadge status={booking.status} />
      </TableCell>
      
      <TableCell className="hidden sm:table-cell">
        <PaymentStatusBadge status={booking.paymentStatus} />
      </TableCell>
      
      <TableCell className="text-right font-medium">
        ฿{booking.totalAmount.toLocaleString()}
      </TableCell>
      
      <TableCell>
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/bookings/${booking.id}`}>
              <span className="sr-only">View Details</span>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
