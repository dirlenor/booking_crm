export interface PricingTier {
  id: string;
  minPax: number;
  maxPax: number | null; // null = unlimited
  pricePerPerson: number;
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  quota: number;
  times?: string[]; // e.g. ["09:00", "13:30"]
  isFlatRate: boolean;
  flatRatePrice?: number;
  pricingTiers: PricingTier[];
}
