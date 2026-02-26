import { HeroSection } from "@/components/features/landing/hero-section";
import { IconMenuSection } from "@/components/features/landing/icon-menu-section";
import { PopularCitiesSection } from "@/components/features/landing/popular-cities";
import { PopularPackages } from "@/components/features/landing/popular-packages";
import { RentBusBanner } from "@/components/features/landing/rent-bus-banner";
import { BestPriceOffer } from "@/components/features/landing/best-price-offer";
import { LogoMarquee } from "@/components/features/landing/logo-marquee";
import { LatestNews } from "@/components/features/landing/news-stats";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <IconMenuSection />
      <PopularCitiesSection />
      <PopularPackages />
      <RentBusBanner />
      <BestPriceOffer />
      <LatestNews />
      <LogoMarquee />
    </>
  );
}
