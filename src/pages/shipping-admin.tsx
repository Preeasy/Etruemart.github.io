import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import {
  Truck,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronRight,
  Globe,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
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
  description: string;
  website: string;
  contactPhone: string;
  contactEmail: string;
  rating: number;
  reviewCount: number;
  established: string;
  active: boolean;
  rates: ShippingRate[];
}

const emptyCarrier: Carrier = {
  id: '',
  name: '',
  logo: '',
  description: '',
  website: '',
  contactPhone: '',
  contactEmail: '',
  rating: 4.5,
  reviewCount: 0,
  established: '',
  active: true,
  rates: [],
};

const emptyRate: ShippingRate = {
  country: '',
  countryCode: '',
  method: 'Express',
  basePrice: 0,
  weightRate: 0,
  volumeRate: 0,
  minDays: 3,
  maxDays: 7,
  currency: 'USD',
  discount: 0,
};

export default function ShippingAdmin() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<{ carrierId: string; rate: ShippingRate; index: number } | null>(null);

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => r.json())
      .then((data) => {
        setCarriers(data.carriers || []);
        setLoading(false);
      });
  }, []);

  const saveCarrier = async () => {
    if (!editingCarrier) return;
    const method = editingCarrier.id && carriers.some((c) => c.id === editingCarrier.id) ? 'PUT' : 'POST';
    const res = await fetch('/api/shipping', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCarrier),
    });
    if (res.ok) {
      const saved = await res.json();
      setCarriers((prev) =>
        method === 'PUT' ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved]
      );
      setShowForm(false);
      setEditingCarrier(null);
    }
  };

  const deleteCarrier = async (id: string) => {
    if (!confirm('Delete this carrier?')) return;
    const res = await fetch(`/api/shipping?id=${id}`, { method: 'DELETE' });
    if (res.ok) setCarriers((prev) => prev.filter((c) => c.id !== id));
  };

  const addRate = () => {
    if (!editingCarrier) return;
    setEditingCarrier({ ...editingCarrier, rates: [...editingCarrier.rates, { ...emptyRate }] });
  };

  const updateRate = (index: number, field: keyof ShippingRate, value: any) => {
    if (!editingCarrier) return;
    const rates = [...editingCarrier.rates];
    rates[index] = { ...rates[index], [field]: value };
    setEditingCarrier({ ...editingCarrier, rates });
  };

  const removeRate = (index: number) => {
    if (!editingCarrier) return;
    setEditingCarrier({ ...editingCarrier, rates: editingCarrier.rates.filter((_, i) => i !== index) });
  };

  const toggleActive = async (carrier: Carrier) => {
    const updated = { ...carrier, active: !carrier.active };
    const res = await fetch('/api/shipping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setCarriers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
  };

  return (
    <Layout>
      <div className="bg-white border-b border-ink-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-ink-500">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium">Home</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <span className="text-navy-800 font-bold">Shipping Admin</span>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy-800 tracking-tight">Shipping Carriers</h1>
            <p className="text-ink-500 mt-1">Manage logistics partners and country-based rates</p>
          </div>
          <button
            onClick={() => {
              setEditingCarrier({ ...emptyCarrier, id: `carrier-${Date.now()}` });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-accent-glow"
          >
            <Plus className="w-4 h-4" />
            Add Carrier
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Truck className="w-10 h-10 text-ink-300 mx-auto mb-3 animate-pulse" />
            <p className="text-ink-400">Loading carriers...</p>
          </div>
        ) : carriers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-ink-200">
            <Truck className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-500 mb-4">No carriers configured yet.</p>
            <button
              onClick={() => {
                setEditingCarrier({ ...emptyCarrier, id: `carrier-${Date.now()}` });
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Carrier
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {carriers.map((carrier) => (
              <div key={carrier.id} className="bg-white rounded-2xl border border-ink-200 shadow-soft overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-navy-800 bg-navy-gradient flex items-center justify-center text-white font-bold text-lg shadow-soft flex-shrink-0">
                        {carrier.logo ? (
                          <img src={carrier.logo} alt={carrier.name} className="w-full h-full object-contain p-1.5" />
                        ) : (
                          carrier.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-navy-800 text-lg">{carrier.name}</h3>
                          <button
                            onClick={() => toggleActive(carrier)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                              carrier.active
                                ? 'bg-success-50 text-success-700 border-success-200'
                                : 'bg-ink-100 text-ink-500 border-ink-200'
                            }`}
                          >
                            {carrier.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {carrier.active ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5">{carrier.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ink-400 flex-wrap">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent-500 fill-accent-500" />{carrier.rating}</span>
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{carrier.rates.length} countries</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{carrier.contactPhone}</span>
                          {carrier.website && (
                            <a href={carrier.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent-600 hover:underline">
                              <ExternalLink className="w-3 h-3" />Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingCarrier({ ...carrier });
                          setShowForm(true);
                        }}
                        className="p-2 text-ink-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCarrier(carrier.id)}
                        className="p-2 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedCarrier(expandedCarrier === carrier.id ? null : carrier.id)}
                        className="p-2 text-ink-400 hover:text-navy-800 hover:bg-ink-50 rounded-lg transition-colors"
                        title="Toggle rates"
                      >
                        {expandedCarrier === carrier.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedCarrier === carrier.id && (
                  <div className="border-t border-ink-100 px-5 pb-5">
                    <div className="flex items-center gap-2 mt-4 mb-3">
                      <Globe className="w-4 h-4 text-accent-500" />
                      <h4 className="text-sm font-bold text-navy-800">Country Rates</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-ink-100 text-ink-400 text-[11px] uppercase tracking-wider">
                            <th className="text-left py-2 px-2">Country</th>
                            <th className="text-left py-2 px-2">Method</th>
                            <th className="text-right py-2 px-2">Base</th>
                            <th className="text-right py-2 px-2">/kg</th>
                            <th className="text-right py-2 px-2">/m³</th>
                            <th className="text-center py-2 px-2">Days</th>
                            <th className="text-right py-2 px-2">Discount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {carrier.rates.map((rate, i) => (
                            <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/50">
                              <td className="py-2 px-2 font-medium text-navy-800">
                                <span className="inline-block w-6 text-[10px] text-ink-400 font-mono mr-1">{rate.countryCode}</span>
                                {rate.country}
                              </td>
                              <td className="py-2 px-2 text-ink-600">{rate.method}</td>
                              <td className="py-2 px-2 text-right font-semibold text-navy-800">${rate.basePrice.toFixed(2)}</td>
                              <td className="py-2 px-2 text-right text-ink-500">${rate.weightRate}</td>
                              <td className="py-2 px-2 text-right text-ink-500">${rate.volumeRate}</td>
                              <td className="py-2 px-2 text-center text-ink-500 text-xs">{rate.minDays}-{rate.maxDays}</td>
                              <td className="py-2 px-2 text-right text-accent-600 font-semibold text-xs">{(rate.discount * 100).toFixed(0)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && editingCarrier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-ink-200">
            <div className="flex items-center justify-between p-5 border-b border-ink-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-navy-800 text-lg">{editingCarrier.id && carriers.some((c) => c.id === editingCarrier.id) ? 'Edit Carrier' : 'New Carrier'}</h3>
              <button onClick={() => { setShowForm(false); setEditingCarrier(null); }} className="p-2 hover:bg-ink-50 rounded-lg text-ink-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Carrier Name</label>
                  <input
                    type="text"
                    value={editingCarrier.name}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, name: e.target.value })}
                    className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    placeholder="e.g. DHL Express"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Logo URL</label>
                  <input
                    type="text"
                    value={editingCarrier.logo}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, logo: e.target.value })}
                    className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Description</label>
                  <input
                    type="text"
                    value={editingCarrier.description}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, description: e.target.value })}
                    className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    placeholder="Short description..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Website</label>
                  <input
                    type="text"
                    value={editingCarrier.website}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, website: e.target.value })}
                    className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={editingCarrier.contactPhone}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    placeholder="+1-800-..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="text"
                    value={editingCarrier.contactEmail}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    placeholder="support@..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={editingCarrier.rating}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, rating: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Reviews</label>
                    <input
                      type="number"
                      value={editingCarrier.reviewCount}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, reviewCount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="active"
                    type="checkbox"
                    checked={editingCarrier.active}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, active: e.target.checked })}
                    className="w-4 h-4 accent-accent-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-ink-700">Active</label>
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent-500" />
                    Country Rates
                  </h4>
                  <button
                    onClick={addRate}
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 hover:text-accent-700 bg-accent-50 hover:bg-accent-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Rate
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {editingCarrier.rates.map((rate, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-ink-50 rounded-xl border border-ink-100 items-end">
                      <div className="col-span-3">
                        <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Country</label>
                        <input
                          type="text"
                          value={rate.country}
                          onChange={(e) => updateRate(i, 'country', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-ink-200 rounded-lg text-xs text-ink-800 focus:outline-none focus:border-accent-500 transition-all"
                          placeholder="Country"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Code</label>
                        <input
                          type="text"
                          value={rate.countryCode}
                          onChange={(e) => updateRate(i, 'countryCode', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 bg-white border border-ink-200 rounded-lg text-xs text-ink-800 focus:outline-none focus:border-accent-500 transition-all"
                          placeholder="US"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Method</label>
                        <input
                          type="text"
                          value={rate.method}
                          onChange={(e) => updateRate(i, 'method', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-ink-200 rounded-lg text-xs text-ink-800 focus:outline-none focus:border-accent-500 transition-all"
                          placeholder="Express"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Base $</label>
                        <input
                          type="number"
                          step="0.1"
                          value={rate.basePrice}
                          onChange={(e) => updateRate(i, 'basePrice', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-ink-200 rounded-lg text-xs text-ink-800 focus:outline-none focus:border-accent-500 transition-all"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">/kg</label>
                        <input
                          type="number"
                          step="0.1"
                          value={rate.weightRate}
                          onChange={(e) => updateRate(i, 'weightRate', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-ink-200 rounded-lg text-xs text-ink-800 focus:outline-none focus:border-accent-500 transition-all"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Days</label>
                        <input
                          type="text"
                          value={`${rate.minDays}-${rate.maxDays}`}
                          onChange={(e) => {
                            const [min, max] = e.target.value.split('-').map(Number);
                            updateRate(i, 'minDays', min || 0);
                            updateRate(i, 'maxDays', max || 0);
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-ink-200 rounded-lg text-xs text-ink-800 focus:outline-none focus:border-accent-500 transition-all"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Disc %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={rate.discount}
                          onChange={(e) => updateRate(i, 'discount', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-ink-200 rounded-lg text-xs text-ink-800 focus:outline-none focus:border-accent-500 transition-all"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end pb-0.5">
                        <button onClick={() => removeRate(i)} className="p-1.5 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
                <button
                  onClick={() => { setShowForm(false); setEditingCarrier(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-ink-500 hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCarrier}
                  className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-accent-glow"
                >
                  <Save className="w-4 h-4" />
                  Save Carrier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
