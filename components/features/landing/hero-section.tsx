"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const onSearch = () => {
    const q = keyword.trim();
    if (!q) {
      router.push("/destinations");
      return;
    }
    router.push(`/destinations?attraction=${encodeURIComponent(q)}`);
  };

  return (
    <section id="home-top" className="relative min-h-[640px] overflow-visible scroll-mt-36" data-section="hero_wrapper">
      <img
        src="/images/kiril-dobrev-v63UL8s28Ew-unsplash.jpg"
        alt="Traveler hero"
        className="absolute inset-0 h-full w-full object-cover"
        data-section="hero_background_image"
      />

      <div className="container mx-auto relative z-10 flex min-h-[640px] items-center justify-center px-4">
        <div className="mx-auto max-w-4xl text-center" data-section="hero_main">
          <h1 className="font-sans text-4xl leading-tight text-white md:text-7xl" data-section="hero_title">
            Simplify Your Travel
            <br />
            <span className="italic">Planning</span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-sm text-white/95 md:text-xl" data-section="hero_subtitle">
            Find routes, discover attractions, and book tours with one smooth flow.
          </p>

          <div className="mx-auto mt-6 max-w-4xl" data-section="hero_bottom_bar">
            <div className="hero-search-glow rounded-2xl p-2 shadow-lg" data-section="hero_search_glow_wrap">
              <div className="hero-search-content flex w-full items-center gap-2 rounded-xl border border-white/60 bg-white/45 px-3 py-1.5" data-section="hero_bottom_search_row">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search attractions (e.g. Universal Studios Japan)"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-600"
                />
                <Button onClick={onSearch} className="h-8 rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90">
                  Search
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
