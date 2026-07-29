import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Truck,
  ChevronDown,
  ChevronUp,
  Globe,
  DollarSign,
  Clock,
  Star,
  Package,
  ArrowRight,
  Search,
} from 'lucide-react';

interface ShippingRate {
  country: string;
  countryCode: string;
  method: string;
  basePrice: number;
  weightRate: number;
  volumeRate: number;
  minDays: number;
  maxDays: number;
  currency: string;
  discount: number;
}

interface Carrier {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  active: boolean;
  rates: ShippingRate[];
}

interface ShippingMatch {
  carrier: Carrier;
  rate: ShippingRate;
  totalCost: number;
  discountedCost: number;
  score: number;
}

interface ShippingSelectorProps {
  categorySlug?: string;
  defaultWeight?: number;
  defaultVolume?: number;
}

const categoryDefaults: Record<string, { weight: number; volume: number }> = {
  'toys-gift': { weight: 0.3, volume: 0.002 },
  'fashion-jewelry': { weight: 0.05, volume: 0.0001 },
  'hair-accessories': { weight: 0.08, volume: 0.0002 },
  'bags-accessories': { weight: 0.25, volume: 0.0015 },
  'garment-accessories': { weight: 0.1, volume: 0.0003 },
  'home-decor-crafts': { weight: 0.2, volume: 0.001 },
};

export default function ShippingSelector({ categorySlug, defaultWeight, defaultVolume }: ShippingSelectorProps) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [weight, setWeight] = useState(defaultWeight || categoryDefaults[categorySlug || '']?.weight || 0.2);
  const [volume, setVolume] = useState(defaultVolume || categoryDefaults[categorySlug || '']?.volume || 0.001);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => r.json())
      .then((data) => {
        setCarriers((data.carriers || []).filter((c: Carrier) => c.active));
        setLoading(false);
      });
  }, []);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    carriers.forEach((c) => c.rates.forEach((r) => set.add(r.country)));
    return Array.from(set).sort();
  }, [carriers]);

  const matches: ShippingMatch[] = useMemo(() => {
    const results: ShippingMatch[] = [];
    carriers.forEach((carrier) => {
      carrier.rates.forEach((rate) => {
        if (rate.country !== selectedCountry) return;
        const base = rate.basePrice;
        const weightCost = rate.weightRate * weight;
        const volumeCost = rate.volumeRate * volume;
        const total = base + weightCost + volumeCost;
        const discounted = total * (1 - rate.discount);
        const speedScore = Math.max(0, 10 - rate.maxDays);
        const priceScore = Math.max(0, 50 - discounted);
        const ratingScore = carrier.rating * 3;
        const score = speedScore + priceScore + ratingScore;
        results.push({
          carrier,
          rate,
          totalCost: total,
          discountedCost: discounted,
          score,
        });
      });
    });
    return results.sort((a, b) => b.score - a.score);
  }, [carriers, selectedCountry, weight, volume]);

  const displayedMatches = showAll ? matches : matches.slice(0, 20);

  const filteredCountries = allCountries.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="w-4 h-4 text-accent-500" />
          <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em]">Shipping & Delivery</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-ink-100 rounded-lg" />
          <div className="h-10 bg-ink-100 rounded-lg" />
          <div className="h-10 bg-ink-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-soft">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
            <Truck className="w-4 h-4 text-accent-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em]">Shipping Options</h3>
            <p className="text-[11px] text-ink-500">{matches.length} matched plans to {selectedCountry}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Country selector */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">Destination Country</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchQuery('')}
                placeholder="Search country..."
                className="w-full pl-9 pr-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
              />
            </div>
            {searchQuery && filteredCountries.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-ink-200 rounded-xl shadow-medium max-h-40 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => {
                      setSelectedCountry(country);
                      setSearchQuery(country);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent-50 transition-colors ${selectedCountry === country ? 'text-accent-600 font-semibold bg-accent-50' : 'text-ink-700'}`}
                  >
                    <Globe className="w-3 h-3 inline mr-2 text-ink-400" />
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weight / Volume inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">Volume (m³)</label>
              <input
                type="number"
                step="0.0001"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {displayedMatches.length === 0 ? (
              <div className="text-center py-6 text-ink-400 text-sm">No shipping options available for this country.</div>
            ) : (
              displayedMatches.map((match, i) => (
                <div
                  key={`${match.carrier.id}-${match.rate.countryCode}`}
                  className={`relative p-3 rounded-xl border transition-all ${
                    i === 0
                      ? 'bg-accent-50/60 border-accent-300 ring-1 ring-accent-200'
                      : 'bg-ink-50 border-ink-100 hover:border-accent-200'
                  }`}
                >
                  {i === 0 && (
                    <span className="absolute -top-2 left-3 px-2 py-0.5 bg-accent-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                      Best Match
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-navy-800 bg-navy-gradient flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 relative">
                        {match.carrier.logo ? (
                          <Image src={match.carrier.logo} alt={match.carrier.name} fill className="object-contain p-0.5" sizes="40px" />
                        ) : (
                          match.carrier.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-navy-800 truncate">{match.carrier.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-ink-500">
                          <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-accent-500 fill-accent-500" />{match.carrier.rating}</span>
                          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{match.rate.minDays}-{match.rate.maxDays} days</span>
                          <span className="text-ink-400">{match.rate.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-navy-800">${match.discountedCost.toFixed(2)}</p>
                      {match.rate.discount > 0 && (
                        <p className="text-[10px] text-ink-400 line-through">${match.totalCost.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {matches.length > 20 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-xs font-bold text-accent-600 hover:text-accent-700 bg-accent-50 hover:bg-accent-100 rounded-xl transition-colors"
            >
              View All {matches.length} Options <ArrowRight className="w-3 h-3 inline ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
