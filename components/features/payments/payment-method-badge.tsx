import { Badge } from "@/components/ui/badge";
import { Payment } from "@/lib/mock-data/payments";

interface PaymentMethodBadgeProps {
  method: Payment["method"];
  className?: string;
}

export function PaymentMethodBadge({ method, className }: PaymentMethodBadgeProps) {
  const getStyle = () => {
    switch (method) {
      case "Credit Card":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
      case "Bank Transfer":
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
      case "PromptPay":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200";
      case "Cash":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
      default:
        return "";
    }
  };

  return (
    <Badge variant="outline" className={`font-medium border ${getStyle()} ${className}`}>
      {method}
    </Badge>
  );
}
