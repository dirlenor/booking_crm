import { HeroSection } from "@/components/features/landing/hero-section";
import { FeaturedDestinations } from "@/components/features/landing/featured-destinations";
import { PopularPackages } from "@/components/features/landing/popular-packages";
import { SpecialOffers } from "@/components/features/landing/special-offers";
import { BestPriceOffer } from "@/components/features/landing/best-price-offer";
import { OurStories } from "@/components/features/landing/our-stories";
import { LatestNews } from "@/components/features/landing/news-stats";
import { ContactSection } from "@/components/features/landing/contact-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturedDestinations />
      <PopularPackages />
      <OurStories />
      <SpecialOffers />
      <BestPriceOffer />
      <LatestNews />
      <ContactSection />
    </>
  );
}
