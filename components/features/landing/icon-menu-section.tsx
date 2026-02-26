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
    <section className="bg-white py-[60px]">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-7 sm:grid-cols-3 md:grid-cols-5">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center justify-start text-center"
            >
              <Image
                src={item.icon}
                alt={item.label}
                className="h-14 w-14 object-contain transition-transform duration-200 group-hover:-translate-y-0.5 md:h-16 md:w-16"
              />
              <span className="mt-3 text-base font-semibold text-slate-900 md:text-lg">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
