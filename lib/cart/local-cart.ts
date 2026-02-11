import { resolveOptionPricing, type PricingOptionLike, type PricingTierLike } from "@/lib/pricing";

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
  unitPrice: number;
  totalPrice: number;
  basePrice?: number;
  pricingTiers?: PricingTierLike[];
  isFlatRate?: boolean;
  flatRatePrice?: number;
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

export function recalculateLocalCartItem(item: LocalCartItem, pax: number): LocalCartItem {
  const nextPax = Math.max(1, Math.floor(pax));
  const pricing = resolveOptionPricing(buildPricingOption(item), nextPax, item.basePrice ?? item.unitPrice);

  return {
    ...item,
    pax: nextPax,
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
