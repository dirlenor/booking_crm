export interface PricingTier {
  id: string;
  minPax: number;
  maxPax: number | null; // null = unlimited
  pricePerPerson: number;
}

export interface PackageOptionSlotRule {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  time: string;
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  groupType?: 'private' | 'join';
  quota: number;
  perks?: string[];
  times?: string[]; // e.g. ["09:00", "13:30"]
  slotRules?: PackageOptionSlotRule[];
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
  isFlatRate: boolean;
  flatRatePrice?: number;
  pricingTiers: PricingTier[];
}
