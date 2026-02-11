import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FeaturedDestinations() {
  const destinations = [
    { name: "Bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1000&auto=format&fit=crop" },
    { name: "Phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1000&auto=format&fit=crop" },
    { name: "Chiang Mai", image: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?q=80&w=1000&auto=format&fit=crop" },
    { name: "Krabi", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop" },
  ];

  return (
    <section id="featured-routes" className="bg-background pb-16 pt-36 md:pt-44 scroll-mt-36">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-primary mb-2">Featured Routes</h2>
          <p className="text-gray-500">Pick a route and explore tours available in that destination.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4" data-section="featured_routes_grid">
          {destinations.map((dest, index) => (
            <div key={index} className="group cursor-pointer" data-section={`featured_route_${dest.name.toLowerCase().replace(/\s+/g, "_")}`}>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-accent">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2 block text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">{dest.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/destinations">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-8">
              View All Routes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
