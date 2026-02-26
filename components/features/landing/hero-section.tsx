"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <section
      id="home-top"
      className="relative -mt-16 h-[40vh] min-h-[340px] overflow-hidden scroll-mt-36 sm:min-h-[380px] md:-mt-20 md:min-h-[430px] lg:min-h-[460px]"
      data-section="hero_wrapper"
    >
      <img
        src="/images/kiril-dobrev-v63UL8s28Ew-unsplash.jpg"
        alt="Traveler hero"
        className="absolute inset-0 h-full w-full object-cover"
        data-section="hero_background_image"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#052438]/70 via-[#052438]/35 to-[#03131f]/70" />

      <div className="container relative z-10 mx-auto h-full px-4 pb-12 md:pb-16">
        <div className="mx-auto h-full max-w-4xl" data-section="hero_main">
          <div
            className="absolute top-[40%] left-1/2 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 sm:top-[41%] sm:w-[calc(100%-2.5rem)] md:top-[43%] md:max-w-[680px] lg:top-[44%]"
            data-section="hero_bottom_bar"
          >
            <div
              className="rounded-full bg-white/92 p-1.5 shadow-[0_12px_34px_rgba(3,19,31,0.35)]"
              data-section="hero_search_glow_wrap"
            >
              <div
                className="flex w-full items-center gap-2.5 rounded-full bg-white px-3.5 py-2 md:px-5"
                data-section="hero_bottom_search_row"
              >
                <Search className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSearch();
                  }}
                  placeholder="Destination, attraction or activity"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500 md:text-base"
                />
              </div>
            </div>
          </div>

          <h1
            className="absolute inset-x-0 bottom-14 px-4 text-center font-sans text-2xl leading-tight text-white sm:text-4xl md:bottom-16 md:text-5xl xl:text-6xl"
            data-section="hero_title"
          >
            Book <span className="font-semibold italic text-[#D6F661]">2,000+</span>
            <br />
            activities thailand.
          </h1>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-primary px-4 py-2.5">
        <p className="text-center text-sm font-semibold text-primary-foreground md:text-base">
          Sign up to enjoy 10% off your first 2 bookings
        </p>
      </div>
    </section>
  );
}
