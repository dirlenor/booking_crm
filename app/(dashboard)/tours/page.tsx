import ToursPageClient, { type TourListItem } from "./tours-page-client";
import { getTours } from "@/lib/supabase/tours";
import { getPackages } from "@/lib/supabase/packages";
import type { PackageOption } from "@/types/package-options";

function normalizeDestinationKey(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/\btoyko\b/g, "tokyo")
    .replace(", japan", "")
    .replace(", thailand", "")
    .trim();
}

function getOptionPriceRange(option: PackageOption): { min: number; max: number } | null {
  if (typeof option.adultPrice === "number" && option.adultPrice > 0) {
    return { min: option.adultPrice, max: option.adultPrice };
  }

  if (option.isFlatRate && typeof option.flatRatePrice === "number" && option.flatRatePrice > 0) {
    return { min: option.flatRatePrice, max: option.flatRatePrice };
  }

  const tierPrices = Array.isArray(option.pricingTiers)
    ? option.pricingTiers
        .map((tier) => Number(tier.pricePerPerson))
        .filter((price) => Number.isFinite(price) && price > 0)
    : [];

  if (tierPrices.length === 0) return null;

  return {
    min: Math.min(...tierPrices),
    max: Math.max(...tierPrices),
  };
}

export default async function ToursPage() {
  const [tourResult, packageResult] = await Promise.all([
    getTours({ page: 1, limit: 100 }),
    getPackages({ page: 1, limit: 200 }),
  ]);

  const packageMap = new Map(
    (packageResult.data?.items ?? []).map((pkg) => [normalizeDestinationKey(pkg.destination), pkg])
  );

  const initialTours: TourListItem[] = tourResult.data.map((item) => {
    const matchedPackage = packageMap.get(normalizeDestinationKey(item.destination));
    const options = Array.isArray(matchedPackage?.options)
      ? matchedPackage.options.filter((option) => option.id !== "__meta__" && option.name !== "__meta__")
      : [];

    const package_previews = options.map((option) => {
      const range = getOptionPriceRange(option);
      return {
        name: option.name,
        price_from: range?.min ?? null,
        price_to: range?.max ?? null,
      };
    });

    const allFrom = package_previews
      .map((pkg) => pkg.price_from)
      .filter((price): price is number => typeof price === "number" && price > 0);
    const allTo = package_previews
      .map((pkg) => pkg.price_to)
      .filter((price): price is number => typeof price === "number" && price > 0);

    return {
      id: item.id,
      name: item.name,
      destination: item.destination,
      duration_days: item.duration_days,
      status: item.status,
      created_at: item.created_at,
      min_pax: item.min_pax,
      max_pax: item.max_pax,
      featured_image_url:
        item.featured_image_url ||
        matchedPackage?.image_url ||
        (Array.isArray(matchedPackage?.image_urls) ? matchedPackage.image_urls[0] ?? null : null),
      package_previews,
      price_min: allFrom.length > 0 ? Math.min(...allFrom) : null,
      price_max: allTo.length > 0 ? Math.max(...allTo) : null,
    };
  });

  return <ToursPageClient initialTours={initialTours} />;
}
