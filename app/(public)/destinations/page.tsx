'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Star, Filter, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import {
  PopularPackageCard,
  type PopularPackage,
} from '@/components/features/landing/popular-package-card';

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

const FilterCheckbox = ({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button type="button" onClick={onToggle} className="w-full flex items-center gap-3 cursor-pointer group text-left">
    <div
      className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
        checked ? 'border-primary bg-primary text-white' : 'border-gray-300 group-hover:border-primary'
      }`}
    >
      {checked ? <Check className="w-3 h-3" /> : null}
    </div>
    <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
    {count !== undefined ? <span className="ml-auto text-xs text-gray-400">({count})</span> : null}
  </button>
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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTourTypes, setSelectedTourTypes] = useState<string[]>([]);

  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('packages')
        .select('id, name, destination, duration, base_price, image_url, image_urls, category, status, options')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const mapped: DestinationItem[] =
        data?.map((pkg) => {
          const options = Array.isArray(pkg.options) ? pkg.options : [];
          const meta = options.find((item) => {
            if (!item || typeof item !== 'object') return false;
            const value = item as { id?: unknown; name?: unknown };
            return value.id === '__meta__' || value.name === '__meta__';
          }) as { meta?: { rating?: number; reviews_count?: number; badge_text?: string } } | undefined;
          const tourType =
            typeof meta?.meta?.badge_text === 'string' && meta.meta.badge_text.trim().length > 0
              ? meta.meta.badge_text.trim()
              : pkg.category ?? 'Cultural';
          const daysMatch = pkg.duration?.match(/(\d+)\s*Day/i);
          const days = daysMatch ? Number(daysMatch[1]) : 1;
          return {
            id: pkg.id,
            title: pkg.name,
            location: pkg.destination ?? 'Thailand',
            price: Number(pkg.base_price ?? 0),
            rating: Number(meta?.meta?.rating ?? 4.7),
            reviews: Number(meta?.meta?.reviews_count ?? 0),
            days,
            image:
              (Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 ? pkg.image_urls[0] : null) ||
              pkg.image_url ||
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
            tags: [tourType],
          };
        }) ?? [];

      setDestinations(mapped);
      setLoading(false);
    };

    loadDestinations();
  }, []);

  const tourTypeCounts = useMemo(() => {
    const counter = new Map<string, number>();
    destinations.forEach((item) => {
      const type = item.tags[0]?.trim();
      if (!type) return;
      counter.set(type, (counter.get(type) ?? 0) + 1);
    });
    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count }));
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return destinations.filter((item) => {
      const type = item.tags[0] ?? '';
      const matchType = selectedTourTypes.length === 0 || selectedTourTypes.includes(type);
      const matchKeyword =
        keyword.length === 0 ||
        item.title.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword);
      return matchType && matchKeyword;
    });
  }, [destinations, searchKeyword, selectedTourTypes]);

  const dataToRender = useMemo(() => {
    if (loading) return [];
      if (filteredDestinations.length > 0) return filteredDestinations;
      return [];
  }, [filteredDestinations, loading]);

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
      <div className="w-full border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Destinations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Explore the World</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl">Discover unforgettable tours and adventures in the world's most breathtaking locations.</p>
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
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    setSelectedTourTypes([]);
                    setSearchKeyword('');
                  }}
                >
                  Reset All
                </button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search destination..."
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
              </div>

              <FilterSection title="Tour Type">
                {tourTypeCounts.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories available.</p>
                ) : (
                  tourTypeCounts.map((item) => (
                    <FilterCheckbox
                      key={item.label}
                      label={item.label}
                      count={item.count}
                      checked={selectedTourTypes.includes(item.label)}
                      onToggle={() => {
                        setSelectedTourTypes((prev) =>
                          prev.includes(item.label)
                            ? prev.filter((name) => name !== item.label)
                            : [...prev, item.label]
                        );
                      }}
                    />
                  ))
                )}
              </FilterSection>

              <FilterSection title="Price Range">
                <PriceRange />
              </FilterSection>

              <FilterSection title="Popular Destinations">
                <FilterCheckbox label="Japan" count={6} checked={false} onToggle={() => {}} />
                <FilterCheckbox label="Italy" count={4} checked={false} onToggle={() => {}} />
                <FilterCheckbox label="Thailand" count={8} checked={false} onToggle={() => {}} />
                <FilterCheckbox label="France" count={3} checked={false} onToggle={() => {}} />
                <FilterCheckbox label="USA" count={10} checked={false} onToggle={() => {}} />
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
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{packagesToRender.length}</span> destination(s)
              </p>
              
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
