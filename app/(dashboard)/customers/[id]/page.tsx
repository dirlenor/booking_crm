"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CustomerProfileView } from "@/components/features/customers/customer-profile-view";
import { getCustomerById, getCustomerBookings } from "@/lib/supabase/customers";
import type { Customer, BookingHistory } from "@/lib/mock-data/customers";
import type { CustomerRow, BookingWithRelations } from "@/types/database";

function mapCustomerRowToUI(row: CustomerRow, bookingsList: BookingWithRelations[]): Customer {
  const initials = row.name
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const lastBookingDate = bookingsList
    .map((b) => b.trips?.date ?? "")
    .filter(Boolean)
    .sort()
    .pop();

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "-",
    totalBookings: bookingsList.length,
    totalSpent: bookingsList.reduce((sum, b) => sum + Number(b.total_amount ?? 0), 0),
    lastBookingDate: lastBookingDate || "-",
    status: row.status,
    tier: row.tier,
    avatarInitials: initials || "--",
  };
}

function mapBookingToHistory(b: BookingWithRelations): BookingHistory {
  const paymentStatus =
    b.payment_status === "refunded" ? "unpaid" : b.payment_status;
  return {
    id: b.id,
    bookingRef: b.booking_ref,
    packageName: b.trips?.packages?.name ?? "-",
    tripDate: b.trips?.date ?? "-",
    amount: Number(b.total_amount ?? 0),
    status: b.status,
    paymentStatus,
    pax: b.pax ?? 0,
  };
}

export default function CustomerProfilePage() {
  const params = useParams<{ id?: string }>();
  const customerId = params?.id ?? "";
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) return;
      setLoading(true);

      const [customerRes, bookingsRes] = await Promise.all([
        getCustomerById(customerId),
        getCustomerBookings(customerId),
      ]);

      if (!customerRes.data) {
        setCustomer(null);
        setBookings([]);
        setLoading(false);
        return;
      }

      const bookingsList = bookingsRes.data ?? [];
      setCustomer(mapCustomerRowToUI(customerRes.data, bookingsList));
      setBookings(bookingsList.map(mapBookingToHistory));
      setLoading(false);
    };

    loadCustomer();
  }, [customerId]);

  const content = useMemo(() => {
    if (loading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading customer...</div>;
    }
    if (!customer) {
      return <div className="p-6 text-sm text-muted-foreground">Customer not found.</div>;
    }
    return <CustomerProfileView customer={customer} bookings={bookings} />;
  }, [loading, customer, bookings]);

  return content;
}
