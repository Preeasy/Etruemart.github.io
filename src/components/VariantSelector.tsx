import { useState } from 'react';
import Link from 'next/link';

interface Variant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  color?: string | null;
  colorHex?: string;
  size?: string | null;
  capacity?: string | null;
  layer?: string | null;
  pack?: string | null;
  material?: string | null;
}

interface Props {
  variants: Variant[];
  currentSku: string;
  baseName: string;
  parentSku: string;
}

const colorToHex = (c?: string | null): string => {
  if (!c) return '#d1d5db';
  const lower = c.toLowerCase();
  if (lower.includes('white')) return '#ffffff';
  if (lower.includes('black')) return '#1f2937';
  if (lower.includes('navy') || lower.includes('dark blue')) return '#1e3a5f';
  if (lower.includes('beige')) return '#e7d4b5';
  if (lower.includes('khaki')) return '#b5a678';
  if (lower.includes('cream')) return '#fef3c7';
  if (lower.includes('brown')) return '#92400e';
  if (lower.includes('gold')) return '#d4af37';
  if (lower.includes('silver') || lower.includes('grey') || lower.includes('gray')) return '#c0c0c0';
  if (lower.includes('red')) return '#ef4444';
  if (lower.includes('green')) return '#22c55e';
  if (lower.includes('blue')) return '#3b82f6';
  if (lower.includes('yellow')) return '#eab308';
  if (lower.includes('pink')) return '#ec4899';
  if (lower.includes('orange')) return '#f97316';
  if (lower.includes('purple')) return '#a855f7';
  return '#d1d5db';
};

export default function VariantSelector({ variants, currentSku, baseName }: Props) {
  const [selectedSku, setSelectedSku] = useState(currentSku);

  // Dedupe: if SIZE and CAPACITY have the same values, drop CAPACITY
  const rawSizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];
  const rawCapacities = [...new Set(variants.map(v => v.capacity).filter(Boolean))] as string[];
  const setsEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.map(x => x.toLowerCase()).every(v => b.map(y => y.toLowerCase()).includes(v));
  const isSizeCapacityDup = rawSizes.length > 0 && rawCapacities.length > 0 && setsEqual(rawSizes, rawCapacities);

  // Build pill labels: color+size combination style
  const getPillLabel = (v: Variant) => {
    const parts: string[] = [];
    if (v.color) parts.push(v.color);
    if (v.size) parts.push(v.size);
    else if (v.capacity && !isSizeCapacityDup) parts.push(v.capacity);
    if (v.layer) parts.push(v.layer);
    if (parts.length === 0 && v.name) {
      // Extract from name if no structured fields
      return v.name.replace(baseName, '').trim() || v.sku;
    }
    return parts.join(' + ') || v.sku;
  };

  if (variants.length === 0) return null;

  return (
    <div>
      {/* Pill-style variant chips */}
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.sku === currentSku;
          const label = getPillLabel(v);
          return (
            <Link
              key={v.sku}
              href={`/products/${v.slug}`}
              onClick={() => setSelectedSku(v.sku)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isSelected
                  ? 'border-ink-800 bg-ink-900 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
              }`}
            >
              {v.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-ink-300 flex-shrink-0"
                  style={{ backgroundColor: v.colorHex || colorToHex(v.color) }}
                />
              )}
              <span>{label}</span>
              <span className={`ml-0.5 font-semibold ${isSelected ? 'text-white/80' : 'text-ink-500'}`}>
                ${v.price.toFixed(2)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
