"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingSearch } from "@/components/features/bookings/booking-search";
import { BookingTable } from "@/components/features/bookings/booking-table";
import { getBookings } from "@/lib/supabase/bookings";
import type { Booking } from "@/lib/mock-data/bookings";
import type { BookingWithRelations } from "@/types/database";
import Link from "next/link";

function mapBookingToUI(row: BookingWithRelations): Booking {
  const customer = row.customers;
  const pkg = row.trips?.packages;
  const tripDate = row.trips?.date ?? "-";

  return {
    id: row.id,
    bookingRef: row.booking_ref,
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
          departureDate: tripDate,
          status: pkg.status,
          category: pkg.category,
          highlights: pkg.highlights ?? [],
          imageUrl: pkg.image_url ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
          options: Array.isArray(pkg.options) ? pkg.options : [],
        }
      : undefined,
    bookingDate: row.booking_date,
    tripDate,
    pax: row.pax ?? 0,
    totalAmount: Number(row.total_amount ?? 0),
    status: row.status,
    paymentStatus: row.payment_status,
    passengers: [],
    payments: [],
    notes: row.notes ?? undefined,
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      const res = await getBookings({ limit: 200 });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setBookings((res.data?.items ?? []).map(mapBookingToUI));
      setLoading(false);
    };

    loadBookings();
  }, []);

  const content = useMemo(() => {
    if (loading) return <div className="text-sm text-muted-foreground">Loading bookings...</div>;
    if (error) return <div className="text-sm text-destructive">{error}</div>;
    return <BookingTable bookings={bookings} />;
  }, [loading, error, bookings]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Bookings</h1>
          <p className="text-muted-foreground">Manage tour reservations and payments.</p>
        </div>
        <Button className="gap-2 shrink-0" asChild>
          <Link href="/bookings/create">
            <Plus className="h-4 w-4" />
            Create Booking
          </Link>
        </Button>
      </div>
      
      <BookingSearch />

      {content}
    </div>
  );
}
