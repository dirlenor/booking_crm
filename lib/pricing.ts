export type PricingTierLike = {
  minPax: number;
  maxPax: number | null;
  pricePerPerson: number;
};

export type PricingOptionLike = {
  isFlatRate?: boolean | null;
  flatRatePrice?: number | null;
  pricingTiers?: PricingTierLike[] | null;
};

export type ResolvedOptionPricing = {
  unitPrice: number;
  total: number;
  isFlatRate: boolean;
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePax = (pax: number) => Math.max(1, Math.floor(toFiniteNumber(pax, 1)));

export const resolveTierPrice = (tiers: PricingTierLike[] = [], pax: number) => {
  const normalizedPax = normalizePax(pax);

  return tiers.find((tier) => {
    const min = toFiniteNumber(tier.minPax, 0);
    const max = tier.maxPax == null
      ? Number.POSITIVE_INFINITY
      : toFiniteNumber(tier.maxPax, Number.POSITIVE_INFINITY);
    return normalizedPax >= min && normalizedPax <= max;
  });
};

export const resolveOptionPricing = (
  option: PricingOptionLike | undefined,
  pax: number,
  fallbackBasePrice: number
): ResolvedOptionPricing => {
  const normalizedPax = normalizePax(pax);
  const fallback = toFiniteNumber(fallbackBasePrice, 0);

  if (!option) {
    return { unitPrice: fallback, total: fallback * normalizedPax, isFlatRate: false };
  }

  if (option.isFlatRate === true) {
    const flatRatePrice = toFiniteNumber(option.flatRatePrice, fallback);
    return { unitPrice: flatRatePrice, total: flatRatePrice, isFlatRate: true };
  }

  const tier = resolveTierPrice(option.pricingTiers ?? [], normalizedPax);
  if (tier) {
    const unitPrice = toFiniteNumber(tier.pricePerPerson, fallback);
    return { unitPrice, total: unitPrice * normalizedPax, isFlatRate: false };
  }

  return { unitPrice: fallback, total: fallback * normalizedPax, isFlatRate: false };
};
