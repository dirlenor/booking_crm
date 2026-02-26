import Image from "next/image";
import booking from "@/image/logopartner/Booking.com_ Hotels & Travel.png";
import expedia from "@/image/logopartner/Expedia_ Hotels, Flights, Cars.png";
import klook from "@/image/logopartner/Klook_ Travel & Activities.png";
import oyo from "@/image/logopartner/OYO_ Hotel Booking App & Deals.png";
import priceline from "@/image/logopartner/Priceline - Hotel, Car, Flight.png";
import traveloka from "@/image/logopartner/Traveloka_ Book Hotel & Flight.png";
import trip from "@/image/logopartner/Trip.com_ Book Flights, Hotels.png";
import tripadvisor from "@/image/logopartner/Tripadvisor_ Plan & Book Trips.png";
import trivago from "@/image/logopartner/trivago_ Compare hotel prices.png";

const logos = [
  { src: booking, alt: "Booking.com" },
  { src: expedia, alt: "Expedia" },
  { src: klook, alt: "Klook" },
  { src: oyo, alt: "OYO" },
  { src: priceline, alt: "Priceline" },
  { src: traveloka, alt: "Traveloka" },
  { src: trip, alt: "Trip.com" },
  { src: tripadvisor, alt: "Tripadvisor" },
  { src: trivago, alt: "trivago" },
];

const marqueeLogos = [...logos, ...logos];

export function LogoMarquee() {
  return (
    <section className="bg-white py-[60px]" data-section="logo_marquee_section">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="logo-marquee-track flex w-max items-center gap-6">
            {marqueeLogos.map((logo, index) => (
              <div
                key={`${logo.alt}-${index}`}
                className="flex h-20 min-w-[190px] items-center justify-center rounded-2xl bg-white px-2"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  unoptimized
                  className="h-12 w-auto rounded-xl object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
