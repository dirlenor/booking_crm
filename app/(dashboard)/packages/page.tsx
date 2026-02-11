"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageTable } from "@/components/features/packages/package-table";
import { PackageSearch } from "@/components/features/packages/package-search";
import { getPackages, deletePackage as deletePackageService } from "@/lib/supabase/packages";
import type { TourPackage } from "@/lib/mock-data/packages";
import type { PackageRow } from "@/types/database";
import { supabase } from "@/lib/supabase/client";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop";

function mapPackageToUI(pkg: PackageRow, aggregate: { dates: string[]; pax: number }): TourPackage {
  const departureDate = aggregate.dates.sort()[0] ?? new Date().toISOString().slice(0, 10);
  const durationLabel = pkg.duration ?? "";
  const dayMatch = durationLabel.match(/(\d+)\s*Day/i);
  const nightMatch = durationLabel.match(/(\d+)\s*Night/i);

  return {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description ?? "",
    destination: pkg.destination ?? "",
    duration: durationLabel,
    days: dayMatch ? Number(dayMatch[1]) : 0,
    nights: nightMatch ? Number(nightMatch[1]) : 0,
    price: Number(pkg.base_price ?? 0),
    maxPax: pkg.max_pax ?? 0,
    currentPax: aggregate.pax,
    departureDate,
    status: pkg.status,
    category: pkg.category,
    highlights: pkg.highlights ?? [],
    imageUrl:
      (Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 ? pkg.image_urls[0] : null) ||
      pkg.image_url ||
      FALLBACK_IMAGE,
    optionsCount: Array.isArray(pkg.options) ? pkg.options.length : 0,
    options: Array.isArray(pkg.options) ? pkg.options : [],
  };
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);

    const [packagesRes, { data: tripRows }, { data: bookingRows }] = await Promise.all([
      getPackages({ limit: 200 }),
      supabase.from("trips").select("id, package_id, date"),
      supabase.from("bookings").select("trip_id, pax"),
    ]);

    if (packagesRes.error) {
      setError(packagesRes.error);
      setLoading(false);
      return;
    }

    const paxByTrip = new Map<string, number>();
    bookingRows?.forEach((booking) => {
      if (!booking.trip_id) return;
      paxByTrip.set(booking.trip_id, (paxByTrip.get(booking.trip_id) ?? 0) + (booking.pax ?? 0));
    });

    const tripsByPackage = new Map<string, { dates: string[]; pax: number }>();
    tripRows?.forEach((trip) => {
      if (!trip.package_id) return;
      const current = tripsByPackage.get(trip.package_id) ?? { dates: [], pax: 0 };
      if (trip.date) current.dates.push(trip.date);
      if (trip.id) current.pax += paxByTrip.get(trip.id) ?? 0;
      tripsByPackage.set(trip.package_id, current);
    });

    const mapped = packagesRes.data.map((pkg) =>
      mapPackageToUI(pkg, tripsByPackage.get(pkg.id) ?? { dates: [], pax: 0 })
    );

    setPackages(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = async (packageId: string) => {
    const { data: tripRows, error: tripError } = await supabase
      .from("trips")
      .select("id", { count: "exact" })
      .eq("package_id", packageId)
      .limit(1);

    if (tripError) {
      alert(tripError.message);
      return;
    }

    if ((tripRows?.length ?? 0) > 0) {
      alert("This package has existing trips and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm("Delete this package? This cannot be undone.");
    if (!confirmed) return;

    const { error: deleteError } = await deletePackageService(packageId);

    if (deleteError) {
      alert(deleteError);
      return;
    }

    loadPackages();
  };

  const content = useMemo(() => {
    if (loading) {
      return <div className="text-sm text-muted-foreground">Loading packages...</div>;
    }
    if (error) {
      return <div className="text-sm text-destructive">{error}</div>;
    }
    return <PackageTable packages={packages} onDelete={handleDelete} />;
  }, [loading, error, packages]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Tour Packages</h1>
          <p className="text-muted-foreground">Manage tour packages, itineraries, and quotas.</p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/packages/create">
            <Plus className="h-4 w-4" />
            Create Package
          </Link>
        </Button>
      </div>
      
      <PackageSearch />

      {content}

    </div>
  );
}
