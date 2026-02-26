import Link from "next/link";
import { MapPin } from "lucide-react";

const cityFilters = [
  "Popular",
  "Central",
  "North",
  "South",
  "Northeast",
  "East",
];

const popularCities = [
  {
    name: "Bangkok",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Chiang Mai",
    image:
      "https://images.unsplash.com/photo-1598935898639-81586f7d2129?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Phuket",
    image:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Pattaya",
    image:
      "https://images.unsplash.com/photo-1701616073554-4cc56ad95f89?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Krabi",
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Ayutthaya",
    image:
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1000&auto=format&fit=crop",
  },
];

export function PopularCitiesSection() {
  return (
    <section className="bg-white py-[60px]">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Explore our destinations</h2>
            <p className="mt-2 text-slate-700">Popular cities across Thailand</p>
          </div>
            <Link
              href="/destinations"
              className="hidden text-base font-semibold text-slate-800 underline-offset-4 transition-colors hover:text-slate-950 hover:underline md:inline"
            >
              See all destinations
            </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {cityFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                index === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:text-slate-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {popularCities.map((city) => (
            <Link
              key={city.name}
              href={`/destinations?city=${encodeURIComponent(city.name)}`}
              className="overflow-hidden rounded-2xl border border-slate-300 bg-white transition-shadow duration-200 hover:shadow-md"
            >
              <div className="h-[210px] overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 text-base font-semibold text-slate-800">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>{city.name}</span>
              </div>
            </Link>
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
