import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PopularPackageCard,
  type PopularPackage,
} from "@/components/features/landing/popular-package-card";
import { getPackages } from "@/lib/supabase/packages";

function mapDurationToDaysLabel(duration: string | null): string {
  if (!duration) return "1 Day";
  const match = duration.match(/(\d+)\s*day/i);
  if (!match) return duration;
  const days = Number(match[1]);
  if (!Number.isFinite(days) || days < 1) return duration;
  return days === 1 ? "1 Day" : `${days} Days`;
}

export async function PopularPackages() {
  const packageRes = await getPackages({ status: "published", limit: 8 });
  const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

  const packages: PopularPackage[] = (packageRes.data?.items ?? []).slice(0, 8).map((pkg) => ({
    id: pkg.id,
    title: pkg.name,
    location: pkg.destination ?? "Thailand",
    days: mapDurationToDaysLabel(pkg.duration),
    rating: 4.8,
    reviews: 100,
    price: `THB ${formatter.format(Number(pkg.base_price ?? 0))}`,
    image:
      (Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 ? pkg.image_urls[0] : null) ||
      pkg.image_url ||
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
    tag: pkg.category ?? "Popular",
  }));

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-2">Popular Tour Packages</h2>
          <p className="text-gray-500">Explore our best-selling tour packages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => (
            <PopularPackageCard key={pkg.id} pkg={pkg} href={`/destinations/${pkg.id}`} showCta={false} />
          ))}
        </div>
        
        <div className="mt-10 flex justify-center">
          <Button variant="outline" className="border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary px-8" asChild>
            <Link href="/destinations">View All Tours</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
