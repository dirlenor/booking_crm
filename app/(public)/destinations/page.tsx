'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Star, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import {
  PopularPackageCard,
  type PopularPackage,
} from '@/components/features/landing/popular-package-card';

const DESTINATIONS = [
  {
    id: 1,
    title: "Kyoto Temple Walk & Tea Ceremony",
    location: "Kyoto, Japan",
    price: 120,
    rating: 4.8,
    reviews: 124,
    days: 1,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    tags: ["Cultural", "Walking"]
  },
  {
    id: 2,
    title: "Santorini Sunset Cruise & Wine",
    location: "Santorini, Greece",
    price: 180,
    rating: 4.9,
    reviews: 89,
    days: 1,
    image: "https://images.unsplash.com/photo-1613395877344-13d4c2ce5d4d?w=800&q=80",
    tags: ["Cruise", "Romantic"]
  },
  {
    id: 3,
    title: "Machu Picchu Inca Trail Trek",
    location: "Cusco, Peru",
    price: 650,
    rating: 4.7,
    reviews: 215,
    days: 4,
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    tags: ["Adventure", "Hiking"]
  },
  {
    id: 4,
    title: "Amalfi Coast Private Boat Tour",
    location: "Amalfi, Italy",
    price: 450,
    rating: 5.0,
    reviews: 56,
    days: 1,
    image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=80",
    tags: ["Luxury", "Boat"]
  },
  {
    id: 5,
    title: "Safari Adventure in Serengeti",
    location: "Serengeti, Tanzania",
    price: 1200,
    rating: 4.9,
    reviews: 142,
    days: 5,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    tags: ["Wildlife", "Safari"]
  },
  {
    id: 6,
    title: "Swiss Alps Ski Experience",
    location: "Zermatt, Switzerland",
    price: 900,
    rating: 4.6,
    reviews: 78,
    days: 3,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80",
    tags: ["Winter", "Skiing"]
  },
  {
    id: 7,
    title: "Bali Temple & Rice Terrace",
    location: "Bali, Indonesia",
    price: 80,
    rating: 4.5,
    reviews: 320,
    days: 1,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    tags: ["Nature", "Culture"]
  },
  {
    id: 8,
    title: "Northern Lights Hunt",
    location: "Tromsø, Norway",
    price: 250,
    rating: 4.7,
    reviews: 95,
    days: 1,
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
    tags: ["Adventure", "Winter"]
  },
  {
    id: 9,
    title: "Grand Canyon Helicopter Tour",
    location: "Arizona, USA",
    price: 350,
    rating: 4.8,
    reviews: 180,
    days: 1,
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80",
    tags: ["Sightseeing", "Adventure"]
  }
];

type DestinationItem = {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  days: number;
  image: string;
  tags: string[];
};

const FilterCheckbox = ({ label, count }: { label: string; count?: number }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className="w-4 h-4 border rounded border-gray-300 group-hover:border-primary flex items-center justify-center transition-colors">
      
    </div>
    <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
    {count !== undefined && <span className="ml-auto text-xs text-gray-400">({count})</span>}
  </label>
);

const PriceRange = () => (
  <div className="space-y-4">
    <div className="h-1 bg-gray-200 rounded-full relative">
      <div className="absolute left-0 w-1/2 h-full bg-primary rounded-full"></div>
      <div className="absolute left-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full -top-1.5 shadow transform -translate-x-1/2 cursor-pointer"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="border rounded px-2 py-1 text-sm text-gray-600 w-20 text-center">$50</div>
      <span className="text-gray-400">-</span>
      <div className="border rounded px-2 py-1 text-sm text-gray-600 w-20 text-center">$5000</div>
    </div>
  </div>
);

const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('packages')
        .select('id, name, destination, duration, base_price, image_url, image_urls, category, status')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const mapped: DestinationItem[] =
        data?.map((pkg) => {
          const daysMatch = pkg.duration?.match(/(\d+)\s*Day/i);
          const days = daysMatch ? Number(daysMatch[1]) : 1;
          return {
            id: pkg.id,
            title: pkg.name,
            location: pkg.destination ?? 'Thailand',
            price: Number(pkg.base_price ?? 0),
            rating: 4.7,
            reviews: 120,
            days,
            image:
              (Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 ? pkg.image_urls[0] : null) ||
              pkg.image_url ||
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
            tags: [pkg.category ?? 'Cultural'],
          };
        }) ?? [];

      setDestinations(mapped);
      setLoading(false);
    };

    loadDestinations();
  }, []);

  const dataToRender = useMemo(() => {
    if (loading) return [];
    if (destinations.length > 0) return destinations;
    if (error) return [];
    return DESTINATIONS.map((item) => ({ ...item, id: String(item.id) }));
  }, [destinations, error, loading]);

  const packagesToRender = useMemo<PopularPackage[]>(() => {
    const priceFormatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    });

    return dataToRender.map((dest) => ({
      id: String(dest.id),
      title: dest.title,
      location: dest.location,
      days: dest.days === 1 ? '1 Day' : `${dest.days} Days`,
      rating: dest.rating,
      reviews: dest.reviews,
      price: `THB ${priceFormatter.format(dest.price)}`,
      image: dest.image,
      tag: dest.tags?.[0] ?? 'Popular',
    }));
  }, [dataToRender]);

  const DestinationsCardSkeleton = () => (
    <div className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-48 bg-gray-100" />
      <div className="p-5">
        <div className="h-4 w-28 bg-gray-100 rounded mb-3" />
        <div className="h-5 w-3/4 bg-gray-100 rounded mb-3" />
        <div className="flex gap-4 mb-4">
          <div className="h-4 w-28 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="pt-4 border-t border-gray-100">
          <div className="h-3 w-10 bg-gray-100 rounded mb-2" />
          <div className="h-5 w-24 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      <div className="relative h-[300px] md:h-[400px] w-full bg-primary overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Destinations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Explore the World</h1>
          <p className="text-lg text-white/80 max-w-2xl">Discover unforgettable tours and adventures in the world's most breathtaking locations.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filters
                </h2>
                <button className="text-sm text-primary hover:underline">Reset All</button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search destination..." className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                </div>
              </div>

              <FilterSection title="Tour Type">
                <FilterCheckbox label="Adventure" count={12} />
                <FilterCheckbox label="City Tours" count={24} />
                <FilterCheckbox label="Cultural" count={8} />
                <FilterCheckbox label="Beaches" count={15} />
                <FilterCheckbox label="Cruises" count={5} />
              </FilterSection>

              <FilterSection title="Price Range">
                <PriceRange />
              </FilterSection>

              <FilterSection title="Popular Destinations">
                <FilterCheckbox label="Japan" count={6} />
                <FilterCheckbox label="Italy" count={4} />
                <FilterCheckbox label="Thailand" count={8} />
                <FilterCheckbox label="France" count={3} />
                <FilterCheckbox label="USA" count={10} />
              </FilterSection>

              <FilterSection title="Rating">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">& Up</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 text-gray-200" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">& Up</span>
                </label>
              </FilterSection>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">Showing <span className="font-semibold text-gray-900">9</span> of <span className="font-semibold text-gray-900">24</span> destinations</p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                <select className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-gray-300 transition-colors">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {loading
                ? Array.from({ length: 9 }).map((_, idx) => (
                    <DestinationsCardSkeleton key={idx} />
                  ))
                : packagesToRender.map((pkg) => (
                    <PopularPackageCard
                      key={pkg.id}
                      pkg={pkg}
                      href={`/destinations/${pkg.id}`}
                      showCta={false}
                    />
                  ))}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" className="h-10 w-10 p-0 rounded-lg text-gray-500 hover:text-primary border-gray-200" disabled>
                <span className="sr-only">Previous</span>
                <ChevronDown className="w-4 h-4 rotate-90" />
              </Button>
              
              <Button className="h-10 w-10 p-0 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
                1
              </Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-lg text-gray-600 hover:text-primary hover:border-primary border-gray-200 bg-white">
                2
              </Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-lg text-gray-600 hover:text-primary hover:border-primary border-gray-200 bg-white">
                3
              </Button>
              <span className="text-gray-400 px-2">...</span>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-lg text-gray-600 hover:text-primary hover:border-primary border-gray-200 bg-white">
                12
              </Button>

              <Button variant="outline" className="h-10 w-10 p-0 rounded-lg text-gray-500 hover:text-primary hover:border-primary border-gray-200 bg-white">
                <span className="sr-only">Next</span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </Button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
