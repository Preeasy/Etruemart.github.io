export interface ShippingRate {
  provider: string;
  baseRate: number;
  perKg: number;
  minDays: number;
  maxDays: number;
}

export interface ShippingQuote {
  provider: string;
  cost: number;
  estimatedDays: string;
}

const SHIPPING_RATES: Record<string, ShippingRate[]> = {
  US: [
    { provider: 'DHL', baseRate: 15, perKg: 5, minDays: 3, maxDays: 5 },
    { provider: 'UPS', baseRate: 12, perKg: 4, minDays: 5, maxDays: 7 },
    { provider: 'YunExpress', baseRate: 8, perKg: 3, minDays: 8, maxDays: 10 },
    { provider: '4PX', baseRate: 7, perKg: 2.5, minDays: 10, maxDays: 15 },
  ],
  CA: [
    { provider: 'DHL', baseRate: 18, perKg: 6, minDays: 4, maxDays: 6 },
    { provider: 'UPS', baseRate: 15, perKg: 5, minDays: 6, maxDays: 8 },
    { provider: 'YunExpress', baseRate: 10, perKg: 4, minDays: 8, maxDays: 12 },
  ],
  UK: [
    { provider: 'DHL', baseRate: 12, perKg: 4, minDays: 2, maxDays: 4 },
    { provider: 'UPS', baseRate: 10, perKg: 3, minDays: 4, maxDays: 6 },
    { provider: 'YunExpress', baseRate: 6, perKg: 2, minDays: 6, maxDays: 8 },
  ],
  DE: [
    { provider: 'DHL', baseRate: 12, perKg: 4, minDays: 2, maxDays: 4 },
    { provider: 'UPS', baseRate: 10, perKg: 3, minDays: 4, maxDays: 6 },
    { provider: 'YunExpress', baseRate: 6, perKg: 2, minDays: 6, maxDays: 8 },
  ],
  FR: [
    { provider: 'DHL', baseRate: 13, perKg: 4.5, minDays: 3, maxDays: 5 },
    { provider: 'UPS', baseRate: 11, perKg: 3.5, minDays: 5, maxDays: 7 },
    { provider: 'YunExpress', baseRate: 7, perKg: 2.5, minDays: 7, maxDays: 10 },
  ],
  AU: [
    { provider: 'DHL', baseRate: 16, perKg: 5.5, minDays: 4, maxDays: 6 },
    { provider: 'UPS', baseRate: 14, perKg: 4.5, minDays: 6, maxDays: 8 },
    { provider: 'YunExpress', baseRate: 9, perKg: 3.5, minDays: 10, maxDays: 14 },
  ],
};

export function calculateShipping(
  country: string,
  weight: number,
  dimensions: { length: number; width: number; height: number }
): ShippingQuote[] {
  const rates = SHIPPING_RATES[country.toUpperCase()] || [];
  const volumetricWeight =
    (dimensions.length * dimensions.width * dimensions.height) / 5000;
  const chargeableWeight = Math.max(weight, volumetricWeight);

  return rates.map((rate) => ({
    provider: rate.provider,
    cost: Math.round((rate.baseRate + chargeableWeight * rate.perKg) * 100) / 100,
    estimatedDays: `${rate.minDays}-${rate.maxDays} days`,
  }));
}