import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import brandLogo from "@/image/Primary_Logo_3_White-01 1.png";

export function LandingFooter() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Image
                src={brandLogo}
                alt="NovaTrip logo"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Experience the world with NovaTrip. We provide premium travel experiences, curated just for you. Discover your next adventure today.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  Popular Cities
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  Transportation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  Travel Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent mt-0.5" />
                <span className="text-gray-300 text-sm">
                  123 Travel Street, Suite 500<br />
                  Bangkok, Thailand 10110
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-gray-300 text-sm">+66 2 123 4567</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-gray-300 text-sm">hello@6catrip.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} NovaTrip. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-400 text-sm">English (US)</span>
            <span className="text-gray-400 text-sm">THB (฿)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
