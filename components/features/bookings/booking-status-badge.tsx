import { Badge } from "@/components/ui/badge";
import { Booking } from "@/lib/mock-data/bookings";

interface BookingStatusBadgeProps {
  status: Booking['status'];
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const getStyle = () => {
    switch (status) {
      case 'confirmed':
        return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
      case 'completed':
        return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
      case 'pending':
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200";
      case 'cancelled':
        return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
      default:
        return "";
    }
  };

  return (
    <Badge variant="outline" className={`capitalize font-medium border ${getStyle()} ${className}`}>
      {status}
    </Badge>
  );
}

interface PaymentStatusBadgeProps {
  status: Booking['paymentStatus'];
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const getStyle = () => {
    switch (status) {
      case 'paid':
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
      case 'partial':
        return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200";
      case 'unpaid':
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
      case 'refunded':
        return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200 line-through decoration-gray-400";
      default:
        return "";
    }
  };

  return (
    <Badge variant="outline" className={`capitalize font-medium border ${getStyle()} ${className}`}>
      {status}
    </Badge>
  );
}
