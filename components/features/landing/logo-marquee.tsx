import Image from "next/image";
import logoPrimary from "@/image/Primary_Logo_3-01.png";
import logoIcon from "@/image/Icon_1-01.png";
import logoWhite from "@/image/Primary_Logo_3_White-01.png";

const logos = [
  { src: logoPrimary, alt: "NovaTrip primary logo", className: "h-10 w-auto" },
  { src: logoIcon, alt: "NovaTrip icon logo", className: "h-10 w-10 rounded-xl" },
  { src: logoWhite, alt: "NovaTrip white logo", className: "h-10 w-auto" },
  { src: logoPrimary, alt: "NovaTrip primary logo", className: "h-10 w-auto" },
  { src: logoIcon, alt: "NovaTrip icon logo", className: "h-10 w-10 rounded-xl" },
  { src: logoWhite, alt: "NovaTrip white logo", className: "h-10 w-auto" },
];

const marqueeLogos = [...logos, ...logos];

export function LogoMarquee() {
  return (
    <section className="bg-white py-10" data-section="logo_marquee_section">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="logo-marquee-track flex w-max items-center gap-10">
            {marqueeLogos.map((logo, index) => (
              <div
                key={`${logo.alt}-${index}`}
                className="flex h-16 min-w-[150px] items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 shadow-sm"
              >
                <Image src={logo.src} alt={logo.alt} className={logo.className} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
