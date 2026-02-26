import Link from "next/link";
import { Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PopularPackage = {
  id: string;
  title: string;
  location: string;
  days: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  tag: string;
};

export function PopularPackageCard({
  pkg,
  href,
  showCta = true,
  className,
  titleClassName,
}: {
  pkg: PopularPackage;
  href?: string;
  showCta?: boolean;
  className?: string;
  titleClassName?: string;
}) {
  const content = (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl",
        className
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
          {pkg.tag}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-yellow-500 text-sm mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-semibold text-gray-900">{pkg.rating}</span>
          <span className="text-gray-400">({pkg.reviews} reviews)</span>
        </div>

        <h3
          className={cn(
            "mb-2 line-clamp-1 text-base font-bold transition-colors",
            titleClassName ?? "text-primary group-hover:text-accent"
          )}
        >
          {pkg.title}
        </h3>

        <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[80px]">{pkg.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{pkg.days}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            <span className="text-xs text-gray-400 block">From</span>
            <span className="text-base font-bold text-primary">{pkg.price}</span>
          </div>
          {showCta && (
            <Button
              size="sm"
              aria-label={`Book ${pkg.title}`}
              className="rounded-lg bg-primary text-white hover:bg-accent hover:text-white transition-colors"
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (href && !showCta) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
