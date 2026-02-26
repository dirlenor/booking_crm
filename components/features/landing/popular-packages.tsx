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

const popularCities = ["Bangkok", "Singapore", "Phuket", "Pattaya", "Chiang Mai"];

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
    <section className="bg-white py-[60px]">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Popular things to do</h2>
            <p className="mt-2 text-slate-700">Top activities in major cities</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {popularCities.map((city, index) => (
                <Link
                  key={city}
                  href={`/destinations?city=${encodeURIComponent(city)}`}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                    index === 0
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:text-slate-800"
                  }`}
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/destinations"
            className="hidden text-base font-semibold text-slate-800 underline-offset-4 transition-colors hover:text-slate-950 hover:underline md:inline"
          >
            See all destinations
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <PopularPackageCard
              key={pkg.id}
              pkg={pkg}
              href={`/destinations/${pkg.id}`}
              showCta={false}
              titleClassName="text-gray-900 group-hover:text-gray-900"
            />
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link
            href="/destinations"
            className="inline-block text-base font-semibold text-slate-800 underline-offset-4 hover:underline"
          >
            See all destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
