import { Badge } from "@/components/ui/badge";
import { Payment } from "@/lib/mock-data/payments";

interface PaymentStatusBadgeProps {
  status: Payment['status'];
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const getStyle = () => {
    switch (status) {
      case 'completed':
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
      case 'pending':
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200";
      case 'failed':
        return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
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
