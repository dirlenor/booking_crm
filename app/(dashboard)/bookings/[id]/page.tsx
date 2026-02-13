"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { BookingDetailView } from "@/components/features/bookings/booking-detail-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBookingById, updateBooking, updateBookingStatus } from "@/lib/supabase/bookings";
import { getPaymentsByBooking, updatePayment } from "@/lib/supabase/payments";
import type { Booking, BookingPayment, BookingPassenger } from "@/lib/mock-data/bookings";
import type { BookingDetail } from "@/types/database";
import { BookingEditModal } from "@/components/features/bookings/booking-edit-modal";

function mapBookingDetailToUI(detail: BookingDetail): Booking {
  const customer = detail.customers;
  const pkg = detail.trips?.packages;

  const mappedPayments: BookingPayment[] =
    detail.payments?.map((p) => ({
      id: p.id,
      bookingId: detail.id,
      amount: Number(p.amount ?? 0),
      date: p.payment_date,
      method: p.method,
      status: p.status === "refunded" ? "completed" : p.status,
      proofUrl: p.slip_url ?? undefined,
    })) ?? [];

  const mappedPassengers: BookingPassenger[] =
    detail.booking_passengers?.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      age: p.age ?? undefined,
      passportNumber: p.passport_number ?? undefined,
      specialRequests: p.special_requests ?? undefined,
    })) ?? [];

  return {
    id: detail.id,
    bookingRef: detail.booking_ref,
    customerId: customer?.id ?? "",
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone ?? "",
          totalBookings: 0,
          totalSpent: 0,
          lastBookingDate: "-",
          status: customer.status,
          tier: customer.tier,
          avatarInitials: customer.name
            .split(" ")
            .filter(Boolean)
            .map((part: string) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
        }
      : undefined,
    packageId: pkg?.id ?? "",
    package: pkg
      ? {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description ?? "",
          destination: pkg.destination ?? "",
          duration: pkg.duration ?? "",
          days: Number(String(pkg.duration ?? "").match(/(\d+)\s*Day/i)?.[1] ?? 0),
          nights: Number(String(pkg.duration ?? "").match(/(\d+)\s*Night/i)?.[1] ?? 0),
          price: Number(pkg.base_price ?? 0),
          maxPax: pkg.max_pax ?? 0,
          currentPax: 0,
          departureDate: detail.trips?.date ?? "-",
          status: pkg.status,
          category: pkg.category,
          highlights: pkg.highlights ?? [],
          imageUrl: pkg.image_url ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
          options: Array.isArray(pkg.options) ? pkg.options : [],
        }
      : undefined,
    bookingDate: detail.booking_date,
    tripDate: detail.trips?.date ?? "-",
    pax: detail.pax ?? 0,
    totalAmount: Number(detail.total_amount ?? 0),
    status: detail.status,
    paymentStatus: detail.payment_status,
    passengers: mappedPassengers,
    payments: mappedPayments,
    notes: detail.notes ?? undefined,
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const res = await getBookingById(id);

    if (!res.data) {
      setBooking(null);
      setLoading(false);
      return;
    }

    setBooking(mapBookingDetailToUI(res.data));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    try {
      const { error } = await updateBookingStatus(booking.id, "cancelled");

      if (error) throw new Error(error);
      loadBooking();
      router.refresh();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking.");
    }
  };

  const handleRefund = async () => {
    if (!booking) return;
    if (!confirm("Are you sure you want to mark this booking as Refunded? This will update the booking status and all related payments.")) return;

    try {
      const paymentsRes = await getPaymentsByBooking(booking.id);
      if (paymentsRes.error) throw new Error(paymentsRes.error);

      if ((paymentsRes.data?.length ?? 0) > 0) {
        const updateResults = await Promise.all(
          paymentsRes.data!.map((payment) => updatePayment(payment.id, { status: "refunded" }))
        );

        const failedPayment = updateResults.find((result) => result.error);
        if (failedPayment?.error) throw new Error(failedPayment.error);
      }

      const bookingRes = await updateBooking(booking.id, { payment_status: "refunded" });
      if (bookingRes.error) throw new Error(bookingRes.error);

      loadBooking();
      router.refresh();
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Failed to process refund.");
    }
  };

  const content = useMemo(() => {
    if (loading) {
      return <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-muted-foreground">Loading booking...</div>;
    }
    if (!booking) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <h2 className="text-xl font-semibold">Booking not found</h2>
          <p className="text-muted-foreground">The booking you are looking for does not exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link href="/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      );
    }
    return (
      <BookingDetailView 
        booking={booking} 
        onEdit={handleEdit} 
        onCancel={handleCancel} 
        onRefund={handleRefund} 
      />
    );
  }, [booking, loading, loadBooking]);

  return (
    <>
      {content}
      {booking && (
        <BookingEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          booking={booking}
          onSuccess={loadBooking}
        />
      )}
    </>
  );
}
