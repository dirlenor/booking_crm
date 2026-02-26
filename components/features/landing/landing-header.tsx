"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, CircleHelp, Download, LogOut, ShoppingCart, Globe, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getLocalCartCount } from "@/lib/cart/local-cart";
import brandLogo from "@/image/Primary_Logo_3-01 1.png";
import brandLogoWhite from "@/image/Primary_Logo_3_White-01 1.png";

export function LandingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartHit, setCartHit] = useState(false);
  const [headerSolid, setHeaderSolid] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const authNext = pathname && pathname !== "/login" && pathname !== "/register" ? pathname : "/";
  const loginHref = `/login?next=${encodeURIComponent(authNext)}`;
  const registerHref = `/register?next=${encodeURIComponent(authNext)}`;
  const isHome = pathname === "/";
  const isOverlay = isHome && !headerSolid;
  const mobileItemClass = isOverlay ? "rounded-md px-2 py-1.5 hover:bg-white/10" : "rounded-md px-2 py-1.5 hover:bg-slate-100";

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
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHome) {
      setHeaderSolid(true);
      return;
    }

    const updateHeaderState = () => {
      setHeaderSolid(window.scrollY > 12);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaderState);
  }, [isHome]);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isOverlay
          ? "border-transparent bg-transparent text-white"
          : "border-gray-200 bg-white/95 text-gray-700 backdrop-blur"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        <Link href="/" className="flex items-center">
          <Image
            src={isOverlay ? brandLogoWhite : brandLogo}
            alt="NovaTrip logo"
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 text-sm md:gap-3">
          <div className="hidden items-center gap-4 xl:flex">
            <Link
              href="/destinations"
              className={`inline-flex items-center gap-1.5 transition-colors ${
                isOverlay ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-primary"
              }`}
            >
              <Download className="h-4 w-4" />
              Get the app
            </Link>

            <button
              type="button"
              className={`inline-flex items-center gap-1 transition-colors ${
                isOverlay ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-primary"
              }`}
            >
              THB
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              className={`inline-flex items-center gap-1 transition-colors ${
                isOverlay ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-primary"
              }`}
            >
              <Globe className="h-4 w-4" />
              English
            </button>

            <Link
              href="/contact"
              className={`inline-flex items-center gap-1.5 transition-colors ${
                isOverlay ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-primary"
              }`}
            >
              <CircleHelp className="h-4 w-4" />
              Support
            </Link>
          </div>

          <Link
            href="/cart"
            data-cart-anchor="true"
            className={`relative transition-all duration-300 ${
              isOverlay ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-primary"
            } ${cartHit ? "scale-125" : "scale-100"}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <span
                className={`absolute -top-2 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white transition-transform duration-300 ${
                  cartHit ? "scale-125" : "scale-100"
                } ${isOverlay ? "bg-white/90 text-primary" : "bg-accent text-white"}`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors xl:hidden ${
              isOverlay
                ? "border-white/45 bg-white/10 text-white hover:border-white/70"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {!authReady ? (
            <div
              className={`h-10 w-[140px] animate-pulse rounded-full ${
                isOverlay ? "bg-white/30" : "bg-gray-100"
              }`}
            />
          ) : user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  isOverlay
                    ? "border-white/45 bg-white/15 text-white hover:border-white/70"
                    : "border-gray-200 bg-white text-primary hover:border-primary/30"
                }`}
              >
                <span className="max-w-[140px] truncate">{displayName}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1.5 text-gray-700 shadow-xl">
                  <Link
                    href="/profile"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
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
              <Link
                href={loginHref}
                className={`hidden text-sm font-semibold transition-colors sm:inline ${
                  isOverlay ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-primary"
                }`}
              >
                Log in
              </Link>
              <Link href={registerHref}>
                <Button
                  className={`h-9 rounded-full px-4 text-xs sm:h-10 sm:px-5 sm:text-sm ${
                    isOverlay
                      ? "border border-white/70 bg-transparent text-white hover:bg-white/12"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div
          className={`border-t xl:hidden ${
            isOverlay ? "border-white/20 bg-[#052438]/92 text-white" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          <div className="container mx-auto grid grid-cols-2 gap-2 px-4 py-3 text-sm font-medium">
            <Link href="/destinations" className={mobileItemClass}>
              Get the app
            </Link>
            <button type="button" className={`${mobileItemClass} text-left`}>
              THB
            </button>
            <button type="button" className={`${mobileItemClass} text-left`}>
              English
            </button>
            <Link href="/contact" className={mobileItemClass}>
              Support
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
