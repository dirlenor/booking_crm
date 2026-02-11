"use client";

import { useEffect, useMemo, useState } from "react";
import { PaymentSearch } from "@/components/features/payments/payment-search";
import { PaymentTable } from "@/components/features/payments/payment-table";
import { RecordPaymentModal } from "@/components/features/payments/record-payment-modal";
import { getPayments } from "@/lib/supabase/payments";
import type { Payment } from "@/lib/mock-data/payments";
import type { PaymentWithBooking } from "@/types/database";

function mapPaymentToUI(p: PaymentWithBooking): Payment {
  return {
    id: p.id,
    bookingId: p.booking_id,
    bookingRef: p.bookings?.booking_ref ?? "-",
    customerName: p.bookings?.customers?.name ?? "-",
    packageName: p.bookings?.trips?.packages?.name ?? "-",
    amount: Number(p.amount ?? 0),
    date: p.payment_date,
    method: p.method,
    status: p.status,
    note: p.note ?? undefined,
    slipUrl: p.slip_url ?? undefined,
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      setError(null);

      const res = await getPayments({ limit: 200 });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setPayments(res.data.map(mapPaymentToUI));
      setLoading(false);
    };

    loadPayments();
  }, []);

  const content = useMemo(() => {
    if (loading) return <div className="text-sm text-muted-foreground">Loading payments...</div>;
    if (error) return <div className="text-sm text-destructive">{error}</div>;
    return <PaymentTable payments={payments} />;
  }, [loading, error, payments]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track and manage booking payments.</p>
        </div>
        <div className="shrink-0">
          <RecordPaymentModal />
        </div>
      </div>
      
      <PaymentSearch />

      {content}
    </div>
  );
}
