// Mirrors the server's authoritative pricing (apps/api bookings module).
export const PRICING = {
  careFee: 95,
  deliveryFee: 250,
  conciergeFee: 180,
};

export interface Quote {
  nights: number;
  dailyRate: number;
  subtotal: number;
  careFee: number;
  addOnsFee: number;
  total: number;
}

export function computeQuote(
  dailyRate: number,
  nights: number,
  opts: { delivery?: boolean; concierge?: boolean } = {}
): Quote {
  const safeNights = Math.max(0, nights);
  const subtotal = dailyRate * safeNights;
  const addOnsFee =
    (opts.delivery ? PRICING.deliveryFee : 0) +
    (opts.concierge ? PRICING.conciergeFee : 0);
  const careFee = safeNights > 0 ? PRICING.careFee : 0;
  return {
    nights: safeNights,
    dailyRate,
    subtotal,
    careFee,
    addOnsFee,
    total: subtotal + careFee + addOnsFee,
  };
}
