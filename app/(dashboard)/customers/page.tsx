"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerSearch } from "@/components/features/customers/customer-search";
import { CustomerTable } from "@/components/features/customers/customer-table";
import { CustomerFormModal } from "@/components/features/customers/customer-form-modal";
import { getCustomers, deleteCustomer as deleteCustomerService } from "@/lib/supabase/customers";
import type { Customer } from "@/lib/mock-data/customers";
import type { CustomerRow } from "@/types/database";
import { supabase } from "@/lib/supabase/client";

function mapCustomerToUI(row: CustomerRow, bookingStats: { count: number; total: number; lastDate?: string }): Customer {
  const initials = row.name
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "-",
    totalBookings: bookingStats.count,
    totalSpent: bookingStats.total,
    lastBookingDate: bookingStats.lastDate ?? "-",
    status: row.status,
    tier: row.tier,
    avatarInitials: initials || "--",
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);

    const [customersRes, { data: bookingRows }] = await Promise.all([
      getCustomers({ limit: 1000 }),
      supabase.from("bookings").select("customer_id, total_amount, booking_date"),
    ]);

    if (customersRes.error) {
      setError(customersRes.error);
      setLoading(false);
      return;
    }

    const stats = new Map<string, { count: number; total: number; lastDate?: string }>();
    bookingRows?.forEach((booking) => {
      if (!booking.customer_id) return;
      const current = stats.get(booking.customer_id) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += Number(booking.total_amount ?? 0);
      if (booking.booking_date) {
        const dateValue = new Date(booking.booking_date).toISOString().slice(0, 10);
        if (!current.lastDate || dateValue > current.lastDate) current.lastDate = dateValue;
      }
      stats.set(booking.customer_id, current);
    });

    const mapped = customersRes.data.map((row) =>
      mapCustomerToUI(row, stats.get(row.id) ?? { count: 0, total: 0 })
    );

    setCustomers(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (customerId: string) => {
    const { data: bookingRows, error: bookingError } = await supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("customer_id", customerId)
      .limit(1);

    if (bookingError) {
      alert(bookingError.message);
      return;
    }

    if ((bookingRows?.length ?? 0) > 0) {
      alert("This customer has existing bookings and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm("Delete this customer? This cannot be undone.");
    if (!confirmed) return;

    const { error: deleteError } = await deleteCustomerService(customerId);

    if (deleteError) {
      alert(deleteError);
      return;
    }

    loadCustomers();
  };

  const content = useMemo(() => {
    if (loading) return <div className="text-sm text-muted-foreground">Loading customers...</div>;
    if (error) return <div className="text-sm text-destructive">{error}</div>;
    return <CustomerTable customers={customers} onDelete={handleDelete} />;
  }, [loading, error, customers]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database and booking history.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>
      
      <CustomerSearch />

      {content}

      <CustomerFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={loadCustomers}
      />
    </div>
  );
}
