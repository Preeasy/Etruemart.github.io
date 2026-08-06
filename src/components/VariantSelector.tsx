import { useState } from 'react';
import Link from 'next/link';
import { Check, Layers } from 'lucide-react';

interface Variant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  color?: string;
  size?: string;
  capacity?: string;
  layer?: string;
  pack?: string;
}

interface Props {
  variants: Variant[];
  currentSku: string;
  baseName: string;
  parentSku: string;
}

// Common color name → CSS background
const COLOR_STYLES: Record<string, string> = {
  black: '#1f2937', white: '#f9fafb', red: '#ef4444', blue: '#3b82f6',
  pink: '#ec4899', green: '#22c55e', purple: '#a855f7', orange: '#f97316',
  yellow: '#eab308', brown: '#92400e', gray: '#6b7280', grey: '#6b7280',
  gold: '#d4af37', silver: '#c0c0c0', beige: '#e7d4b5', clear: 'transparent',
  mint: '#14b8a6', navy: '#1e3a5f', rose: '#f43f5e', coral: '#fb7185',
  lavender: '#a78bfa', turquoise: '#06b6d4', burgundy: '#7c2d12',
};

function getColorBg(color?: string): string {
  if (!color) return '#ccc';
  const lower = color.toLowerCase().trim();
  if (COLOR_STYLES[lower]) return COLOR_STYLES[lower];
  for (const key of Object.keys(COLOR_STYLES)) {
    if (lower.includes(key)) return COLOR_STYLES[key];
  }
  if (/^#[0-9a-f]{6}$/i.test(lower)) return lower;
  return '#ccc';
}

export default function VariantSelector({ variants, currentSku, baseName, parentSku }: Props) {
  const [selectedSku, setSelectedSku] = useState(currentSku);

  const currentVariant = variants.find(v => v.sku === currentSku) || variants[0];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];
  const capacities = [...new Set(variants.map(v => v.capacity).filter(Boolean))] as string[];
  const layers = [...new Set(variants.map(v => v.layer).filter(Boolean))] as string[];

  const renderSwatchGroup = (
    label: string,
    values: string[],
    renderButton: (value: string, isSelected: boolean, href: string) => React.ReactNode
  ) => {
    if (values.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-xs font-semibold text-ink-500 mb-2 uppercase tracking-wide">{label}</p>
        <div className="flex flex-wrap gap-2">
          {values.map(value => {
            const matchingVariants = variants.filter(v =>
              (v.color === value) || (v.size === value) || (v.capacity === value) || (v.layer === value)
            );
            const firstVariant = matchingVariants[0];
            if (!firstVariant) return null;
            const isSelected = matchingVariants.some(v => v.sku === selectedSku);
            return renderButton(value, isSelected, `/products/${firstVariant.slug}`);
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gradient-to-br from-navy-50/60 to-white rounded-xl border border-navy-100">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-accent-500" />
        <span className="text-sm font-bold text-navy-800">
          {variants.length} styles available
        </span>
        <span className="text-xs text-ink-400 ml-auto font-mono">
          {parentSku}
        </span>
      </div>

      {/* Color selector */}
      {renderSwatchGroup('Color', colors, (color, isSelected, href) => (
        <Link
          key={color}
          href={href}
          className="group relative flex flex-col items-center gap-1"
          onClick={() => setSelectedSku(variants.find(v => v.color === color)?.sku || currentSku)}
        >
          <div
            className={`w-7 h-7 rounded-full border-2 ${isSelected ? 'ring-2 ring-accent-500 ring-offset-2 border-accent-500' : 'border-ink-200'} transition-all group-hover:scale-110 flex items-center justify-center`}
            style={{ background: getColorBg(color) }}
          >
            {isSelected && color.toLowerCase() !== 'white' && color.toLowerCase() !== 'clear' && (
              <Check className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <span className="text-[10px] text-ink-500 group-hover:text-navy-700 capitalize">{color}</span>
        </Link>
      ))}

      {/* Size selector */}
      {renderSwatchGroup('Size / Spec', sizes, (size, isSelected, href) => (
        <Link
          key={size}
          href={href}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            isSelected
              ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
              : 'bg-white text-ink-700 border-ink-200 hover:border-accent-300 hover:bg-accent-50'
          }`}
          onClick={() => setSelectedSku(variants.find(v => v.size === size)?.sku || currentSku)}
        >
          {size.toUpperCase()}
        </Link>
      ))}

      {/* Capacity selector */}
      {renderSwatchGroup('Capacity', capacities, (capacity, isSelected, href) => (
        <Link
          key={capacity}
          href={href}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            isSelected
              ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
              : 'bg-white text-ink-700 border-ink-200 hover:border-accent-300 hover:bg-accent-50'
          }`}
          onClick={() => setSelectedSku(variants.find(v => v.capacity === capacity)?.sku || currentSku)}
        >
          {capacity}
        </Link>
      ))}

      {/* Layer selector */}
      {renderSwatchGroup('Layers', layers, (layer, isSelected, href) => (
        <Link
          key={layer}
          href={href}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            isSelected
              ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
              : 'bg-white text-ink-700 border-ink-200 hover:border-accent-300 hover:bg-accent-50'
          }`}
          onClick={() => setSelectedSku(variants.find(v => v.layer === layer)?.sku || currentSku)}
        >
          {layer}
        </Link>
      ))}

      {/* All variants grid — fallback when no structured attributes */}
      {!colors.length && !sizes.length && !capacities.length && !layers.length && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {variants.map(v => (
            <Link
              key={v.sku}
              href={`/products/${v.slug}`}
              className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                v.sku === currentSku
                  ? 'border-accent-500 ring-2 ring-accent-500 ring-offset-1'
                  : 'border-ink-200 hover:border-accent-300'
              } ${v.stock === 0 ? 'opacity-40' : ''}`}
              title={`${v.name} - $${v.price.toFixed(2)}`}
            >
              <img
                src={v.image}
                alt={v.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {v.stock === 0 && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">OUT</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-navy-100 flex items-center justify-between">
        <span className="text-xs text-ink-500 truncate">
          Selected: <span className="font-semibold text-navy-700">{currentVariant?.name}</span>
        </span>
        {currentVariant?.price > 0 && (
          <span className="text-sm font-bold text-accent-600 flex-shrink-0 ml-2">
            ${currentVariant.price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
