"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, LogOut, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getLocalCartCount } from "@/lib/cart/local-cart";
import brandLogo from "@/image/Primary_Logo_3-01 1.png";

export function LandingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartHit, setCartHit] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pageMenuRef = useRef<HTMLDivElement | null>(null);
  const authNext = pathname && pathname !== "/login" && pathname !== "/register" ? pathname : "/";
  const loginHref = `/login?next=${encodeURIComponent(authNext)}`;
  const registerHref = `/register?next=${encodeURIComponent(authNext)}`;

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(data.user ?? null);
      setAuthReady(true);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const syncCartCount = () => setCartCount(getLocalCartCount());
    syncCartCount();

    window.addEventListener("storage", syncCartCount);
    window.addEventListener("6cat-cart-updated", syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("6cat-cart-updated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    const onCartHit = () => {
      setCartHit(true);
      window.setTimeout(() => setCartHit(false), 320);
    };

    window.addEventListener("6cat-cart-hit", onCartHit);
    return () => window.removeEventListener("6cat-cart-hit", onCartHit);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }

      if (pageMenuRef.current && !pageMenuRef.current.contains(event.target as Node)) {
        setPageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    const meta = user.user_metadata ?? {};
    const fullName =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      (typeof meta.name === "string" && meta.name.trim()) ||
      "";
    if (fullName) return fullName;
    if (user.email) return user.email.split("@")[0] ?? user.email;
    return "Traveler";
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const submitSearch: NonNullable<ComponentProps<"form">["onSubmit"]> = (event) => {
    event.preventDefault();
    const query = searchKeyword.trim();
    if (!query) {
      router.push("/destinations");
      return;
    }
    router.push(`/destinations?attraction=${encodeURIComponent(query)}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
      <div className="border-b border-gray-100">
        <div className="container mx-auto flex h-16 items-center gap-3 px-4">
          <Link href="/" className="flex items-center">
            <Image
              src={brandLogo}
              alt="NovaTrip logo"
              className="h-8 w-auto"
              priority
            />
          </Link>

          <form onSubmit={submitSearch} className="hidden md:flex max-w-xl flex-1 items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2" data-section="header_attraction_search">
            <Search className="mr-2 h-4 w-4 text-gray-500" />
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Search attractions or routes"
              className="h-6 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </form>

          <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
            <div className="hidden lg:flex items-center gap-1">
              <span>THB</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>

            <Link
              href="/cart"
              data-cart-anchor="true"
              className={`relative text-gray-600 hover:text-primary transition-all duration-300 ${cartHit ? "scale-125 text-primary" : "scale-100"}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className={`absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-semibold leading-[18px] text-center transition-transform duration-300 ${cartHit ? "scale-125" : "scale-100"}`}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>

            {!authReady ? (
              <div className="h-10 w-[140px] rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-primary hover:border-primary/30"
                >
                  <span className="max-w-[140px] truncate">{displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                    <Link
                      href="/profile"
                      className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link href={registerHref} className="hidden md:inline text-sm font-semibold text-gray-700 hover:text-primary">
                  Sign up
                </Link>
                <Link href={loginHref}>
                  <Button className="h-10 rounded-full bg-primary px-5 text-white hover:bg-primary/90">Log in</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 text-[15px] font-medium text-gray-700">
          <div className="flex items-center gap-7">
            <Link href="/#home-top" className="hover:text-primary">Home</Link>
            <Link href="/destinations" className="hover:text-primary">Attrachtion</Link>
            <Link href="/about" className="hover:text-primary">About Us</Link>
            <Link href="/contact" className="hover:text-primary">Contact Us</Link>
          </div>

          <div ref={pageMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setPageMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary"
            >
              Page
              <ChevronDown className="h-4 w-4" />
            </button>

            {pageMenuOpen ? (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/about", label: "About Us" },
                    { href: "/contact", label: "Contact Us" },
                    { href: "/cart", label: "Cart" },
                    { href: "/checkout", label: "Checkout" },
                    { href: "/payment", label: "Payment" },
                    { href: "/thank-you", label: "Thank You" },
                    { href: "/profile", label: "Profile" },
                    { href: loginHref, label: "Login" },
                    { href: registerHref, label: "Register" },
                  ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setPageMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
