import Link from "next/link";
import { MoveRight } from "lucide-react";
import { getPackages } from "@/lib/supabase/packages";
import { Button } from "@/components/ui/button";

const FALLBACK_DESTINATIONS = [
  { name: "Koh Phi Phi, Thailand", image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80" },
  { name: "Krabi, Thailand", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80" },
  { name: "Phang Nga, Thailand", image: "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?w=1200&q=80" },
  { name: "Koh Lipe, Thailand", image: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=80" },
  { name: "Surin Islands, Thailand", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80" },
  { name: "Koh Yao Noi, Thailand", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80" },
];

const DESTINATION_IMAGE_HINTS: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["phi phi", "phuket"], image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80" },
  { keywords: ["krabi"], image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80" },
  { keywords: ["samui", "ang thong"], image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=1200&q=80" },
  { keywords: ["koh tao", "nang yuan"], image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80" },
  { keywords: ["similan", "khao lak"], image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80" },
  { keywords: ["lipe", "satun"], image: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=80" },
  { keywords: ["phang nga", "hong"], image: "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?w=1200&q=80" },
  { keywords: ["surin"], image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80" },
];

function resolveDestinationFallbackImage(destinationName: string): string {
  const key = destinationName.toLowerCase();
  const hint = DESTINATION_IMAGE_HINTS.find((item) => item.keywords.some((word) => key.includes(word)));
  return hint?.image ?? FALLBACK_DESTINATIONS[0].image;
}

export async function FeaturedDestinations() {
  const packageRes = await getPackages({ status: "published", limit: 50 });
  const packages = packageRes.data?.items ?? [];
  const uniqueDestinations = Array.from(
    new Set(
      packages
        .map((pkg) => (pkg.destination ?? "").trim())
        .filter((name) => name.length > 0)
    )
  ).slice(0, 8);

  const destinations = uniqueDestinations.length > 0
    ? uniqueDestinations.map((name) => {
        const representativePackage = packages.find(
          (pkg) => (pkg.destination ?? "").trim().toLowerCase() === name.toLowerCase()
        );

        const packageImage =
          representativePackage?.image_url ??
          representativePackage?.image_urls?.find((image) => typeof image === "string" && image.trim().length > 0) ??
          null;

        return {
          name,
          image: packageImage || resolveDestinationFallbackImage(name),
        };
      })
    : FALLBACK_DESTINATIONS;

  const mergedDestinations = [
    ...destinations,
    ...FALLBACK_DESTINATIONS.filter(
      (fallback) => !destinations.some((dest) => dest.name.toLowerCase() === fallback.name.toLowerCase())
    ),
  ];
  const showcaseDestinations = mergedDestinations.slice(0, 5);

  return (
    <section id="featured-routes" className="bg-background py-16 md:py-24 scroll-mt-36">
      <div className="container mx-auto px-4">
        <div className="px-1 py-8 md:px-2 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
            <div>
              <span className="text-accent font-bold uppercase tracking-wide text-sm">
                Feature Route
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-6">
                Not your boring
                <br />
                travel agency.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                We plan each route with local context, clear logistics, and a team that stays with you before and during the trip.
              </p>
              <Button variant="outline" className="mt-8 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary px-8" asChild>
                <Link href="/destinations" className="inline-flex items-center gap-2">
                  Book a route
                  <MoveRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-nowrap items-end gap-4 overflow-x-auto pb-2 no-scrollbar xl:overflow-visible" data-section="featured_routes_grid">
              {showcaseDestinations.map((dest, index) => {
                const cardSizeClass = index === 0
                  ? "min-w-[220px] sm:min-w-[260px] xl:min-w-0 xl:flex-[1.35]"
                  : "min-w-[170px] sm:min-w-[200px] xl:min-w-0 xl:flex-1";
                const imageHeightClass = "h-[250px] md:h-[280px]";

                return (
                  <Link
                    href="/destinations"
                    key={dest.name}
                    className={`group cursor-pointer ${cardSizeClass}`}
                    data-section={`featured_route_${dest.name.toLowerCase().replace(/\s+/g, "_")}`}
                  >
                    <div className={`relative overflow-hidden rounded-2xl ${imageHeightClass} border border-slate-200 bg-white shadow-sm transition-transform duration-300 group-hover:-translate-y-1`}>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-4 py-3">
                        <span className="inline-flex rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                          Featured
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{dest.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Cultural walks with local guides</p>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
