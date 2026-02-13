import Link from "next/link";
import { getPackages } from "@/lib/supabase/packages";

const FALLBACK_DESTINATIONS = [
  { name: "Koh Phi Phi, Thailand", image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80" },
  { name: "Krabi, Thailand", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80" },
  { name: "Phang Nga, Thailand", image: "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?w=1200&q=80" },
  { name: "Koh Lipe, Thailand", image: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=80" },
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
  ).slice(0, 4);

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

  return (
    <section id="featured-routes" className="bg-background py-16 scroll-mt-36">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-primary mb-2">Featured Routes</h2>
          <p className="text-gray-500">Pick a route and explore tours available in that destination.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4" data-section="featured_routes_grid">
          {destinations.map((dest, index) => (
            <Link href="/destinations" key={index} className="group cursor-pointer" data-section={`featured_route_${dest.name.toLowerCase().replace(/\s+/g, "_")}`}>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-accent">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2 block text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">{dest.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
