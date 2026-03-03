import Link from "next/link";
import Image from "next/image";
import iconTransport from "@/image/iconmenu/image 10.png";
import iconTicket from "@/image/iconmenu/image 11.png";
import iconAttraction from "@/image/iconmenu/image 12.png";
import iconBook from "@/image/iconmenu/image 17.png";
import iconTravel from "@/image/iconmenu/travel (1) 1.png";

const menuItems = [
  { label: "Trips", icon: iconTravel, href: "/destinations" },
  { label: "Transport", icon: iconTransport, href: "/destinations" },
  { label: "Ticket", icon: iconTicket, href: "/destinations" },
  { label: "Attraction", icon: iconAttraction, href: "/destinations" },
  { label: "Booking", icon: iconBook, href: "/destinations" },
];

export function IconMenuSection() {
  return (
    <section className="bg-white pt-16 pb-8 md:py-[60px]">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl md:hidden">
          <div className="flex items-start justify-center gap-x-8">
            {menuItems.slice(0, 3).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex w-[88px] flex-col items-center justify-start text-center"
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  className="h-14 w-14 object-contain transition-transform duration-200 group-hover:-translate-y-0.5"
                />
                <span className="mt-3 text-base font-semibold text-slate-900">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-7 flex items-start justify-center gap-x-8">
            {menuItems.slice(3).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex w-[88px] flex-col items-center justify-start text-center"
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  className="h-14 w-14 object-contain transition-transform duration-200 group-hover:-translate-y-0.5"
                />
                <span className="mt-3 text-base font-semibold text-slate-900">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto hidden max-w-5xl md:grid md:grid-cols-5 md:gap-y-7">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center justify-start text-center"
            >
              <Image
                src={item.icon}
                alt={item.label}
                className="h-16 w-16 object-contain transition-transform duration-200 group-hover:-translate-y-0.5"
              />
              <span className="mt-3 text-lg font-semibold text-slate-900">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
