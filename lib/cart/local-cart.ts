import { resolveOptionPricing, type PricingOptionLike, type PricingTierLike } from "@/lib/pricing";

export type PassengerBreakdown = {
  adult: number;
  child: number;
  infant: number;
};

export type LocalCartItem = {
  id: string;
  packageId: string;
  tripId: string;
  title: string;
  image: string;
  location: string;
  tripDate: string;
  tripTime?: string;
  optionId?: string;
  optionName?: string;
  pax: number;
  passengers?: PassengerBreakdown;
  unitPrice: number;
  totalPrice: number;
  basePrice?: number;
  pricingTiers?: PricingTierLike[];
  isFlatRate?: boolean;
  flatRatePrice?: number;
  minPax?: number;
  maxPax?: number | null;
  adultUnitPrice?: number;
  childUnitPrice?: number;
  infantUnitPrice?: number;
};

const CART_KEY = "6cat_cart_v1";

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalCartItem[];
  } catch {
    return [];
  }
}

export function setLocalCart(items: LocalCartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("6cat-cart-updated"));
}

export function getLocalCartCount() {
  return getLocalCart().length;
}

const buildPricingOption = (item: LocalCartItem): PricingOptionLike | undefined => {
  const hasTierPricing = Array.isArray(item.pricingTiers) && item.pricingTiers.length > 0;
  if (!item.isFlatRate && !hasTierPricing) {
    return undefined;
  }

  return {
    isFlatRate: item.isFlatRate ?? false,
    flatRatePrice: item.flatRatePrice,
    pricingTiers: item.pricingTiers ?? [],
  };
};

const toInt = (value: number, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.floor(parsed);
};

const clampPax = (item: LocalCartItem, pax: number) => {
  const min = Math.max(1, toInt(item.minPax ?? 1, 1));
  const maxRaw = toInt(item.maxPax ?? Number.NaN, Number.NaN);
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : null;
  const normalized = Math.max(min, toInt(pax, min));
  return max ? Math.min(max, normalized) : normalized;
};

export function recalculateLocalCartItem(item: LocalCartItem, pax: number): LocalCartItem {
  const nextPax = clampPax(item, pax);

  const hasBreakdown = !!item.passengers;
  const hasSplitUnitPricing =
    typeof item.adultUnitPrice === "number" ||
    typeof item.childUnitPrice === "number" ||
    typeof item.infantUnitPrice === "number";

  if (!item.isFlatRate && hasBreakdown && hasSplitUnitPricing) {
    const current = item.passengers ?? { adult: item.pax, child: 0, infant: 0 };
    const delta = nextPax - item.pax;
    const nextAdult = Math.max(1, current.adult + delta);
    const nextChild = Math.max(0, current.child);
    const nextInfant = Math.max(0, current.infant);
    const computedPax = nextAdult + nextChild + nextInfant;

    const adultUnit = item.adultUnitPrice ?? item.unitPrice;
    const childUnit = item.childUnitPrice ?? adultUnit;
    const infantUnit = item.infantUnitPrice ?? 0;
    const totalPrice = nextAdult * adultUnit + nextChild * childUnit + nextInfant * infantUnit;

    return {
      ...item,
      pax: computedPax,
      passengers: {
        adult: nextAdult,
        child: nextChild,
        infant: nextInfant,
      },
      unitPrice: adultUnit,
      totalPrice,
      isFlatRate: false,
      flatRatePrice: undefined,
    };
  }

  const pricing = resolveOptionPricing(buildPricingOption(item), nextPax, item.basePrice ?? item.unitPrice);

  return {
    ...item,
    pax: nextPax,
    passengers: item.isFlatRate
      ? {
          adult: nextPax,
          child: 0,
          infant: 0,
        }
      : item.passengers,
    unitPrice: pricing.unitPrice,
    totalPrice: pricing.total,
    isFlatRate: pricing.isFlatRate,
    flatRatePrice: pricing.isFlatRate ? pricing.unitPrice : undefined,
  };
}

export function addLocalCartItem(newItem: LocalCartItem) {
  const cart = getLocalCart();
  const mergeIndex = cart.findIndex(
    (item) =>
      item.packageId === newItem.packageId &&
      item.tripId === newItem.tripId &&
      (item.optionId ?? "") === (newItem.optionId ?? "")
  );

  if (mergeIndex >= 0) {
    const existing = cart[mergeIndex];
    if (!existing) return;
    const nextPax = existing.pax + newItem.pax;
    cart[mergeIndex] = recalculateLocalCartItem({
      ...existing,
      ...newItem,
      pax: nextPax,
    }, nextPax);
    setLocalCart(cart);
    return;
  }

  setLocalCart([...cart, recalculateLocalCartItem(newItem, newItem.pax)]);
}
