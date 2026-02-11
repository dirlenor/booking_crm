import { ArrowLeft, Edit, Printer, Send, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/mock-data/bookings";
import { BookingStatusBadge } from "./booking-status-badge";
import Link from "next/link";

interface BookingDetailHeaderProps {
  booking: Booking;
  onEdit: () => void;
  onCancel: () => void;
  onRefund: () => void;
}

export function BookingDetailHeader({ booking, onEdit, onCancel, onRefund }: BookingDetailHeaderProps) {
  const canCancel = booking.status !== "cancelled" && booking.status !== "completed";
  const canRefund = booking.paymentStatus !== "refunded" && booking.paymentStatus !== "unpaid";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Link href="/bookings" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {booking.bookingRef}
            </h1>
            <BookingStatusBadge status={booking.status} className="text-sm px-2.5 py-0.5" />
          </div>
          <p className="text-muted-foreground">
            Created on {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(booking.bookingDate))}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {canRefund && (
            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onRefund}>
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Refund</span>
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onCancel}>
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </Button>
          <Button size="sm" className="gap-2" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
