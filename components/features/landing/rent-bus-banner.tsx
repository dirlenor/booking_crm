import Image from "next/image";
import Link from "next/link";
import retroBus from "@/image/retro bus.png";

export function RentBusBanner() {
  return (
    <section className="bg-white py-[60px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="relative flex h-[84px] w-full items-center justify-center rounded-xl bg-primary md:w-[220px]">
            <Image
              src={retroBus}
              alt="Retro bus"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[116px] w-auto -translate-x-1/2 -translate-y-1/2 -rotate-6 object-contain md:h-[132px]"
              priority={false}
            />
          </div>

          <div className="flex h-[84px] w-full items-center justify-between rounded-xl bg-primary px-6 md:px-8">
            <p className="text-sm font-semibold text-white md:text-xl">
              More Service Rent bus to <span className="text-lg font-bold italic text-[#D6F661] md:text-2xl">pick up</span> from airport
            </p>

            <Link
              href="/destinations"
              className="ml-4 inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
