import { useState } from 'react';
import Link from 'next/link';
import { Check, Layers, Palette, Maximize2, Box } from 'lucide-react';

interface Variant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  color?: string;
  colorHex?: string;
  size?: string;
  capacity?: string;
  layer?: string;
  pack?: string;
  material?: string;
}

interface Props {
  variants: Variant[];
  currentSku: string;
  baseName: string;
  parentSku: string;
}

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#1f2937', white: '#f9fafb', red: '#ef4444', blue: '#3b82f6',
  navy: '#1e3a5f', pink: '#ec4899', green: '#22c55e', purple: '#a855f7',
  orange: '#f97316', yellow: '#eab308', brown: '#92400e', gray: '#6b7280',
  grey: '#6b7280', gold: '#d4af37', silver: '#c0c0c0', beige: '#e7d4b5',
  clear: 'transparent', mint: '#14b8a6', coral: '#fb7185',
  burgundy: '#7c2d12', cream: '#fef3c7', khaki: '#b5a678',
  'rose gold': '#f43f5e', 'multi-color': 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#eab308)',
  'black & white': 'linear-gradient(135deg,#1f2937,#f9fafb)',
};

function getColorBg(color?: string, hex?: string): string {
  if (hex) return hex;
  if (!color) return '#ccc';
  const lower = color.toLowerCase().trim();
  if (COLOR_HEX_MAP[lower]) return COLOR_HEX_MAP[lower];
  for (const key of Object.keys(COLOR_HEX_MAP)) {
    if (lower.includes(key)) return COLOR_HEX_MAP[key];
  }
  if (/^#[0-9a-f]{6}$/i.test(lower)) return lower;
  return '#ccc';
}

export default function VariantSelector({ variants, currentSku, baseName, parentSku }: Props) {
  const [selectedSku, setSelectedSku] = useState(currentSku);

  const currentVariant = variants.find(v => v.sku === currentSku) || variants[0];

  // Extract unique attribute values
  const uniqueColors = [...new Map(
    variants.filter(v => v.color).map(v => [v.color!.toLowerCase(), v])
  ).values()];
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];
  const uniqueCapacities = [...new Set(variants.map(v => v.capacity).filter(Boolean))] as string[];
  const uniqueLayers = [...new Set(variants.map(v => v.layer).filter(Boolean))] as string[];
  const uniqueMaterials = [...new Set(variants.map(v => v.material).filter(Boolean))] as string[];

  const hasStructuredData = uniqueColors.length > 0 || uniqueSizes.length > 0 || uniqueCapacities.length > 0 || uniqueLayers.length > 0;

  const handleSkuSelect = (sku: string) => {
    setSelectedSku(sku);
  };

  const renderColorSwatches = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Palette className="w-3.5 h-3.5 text-ink-400" />
        <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Color</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {uniqueColors.map((v, i) => {
          const isSelected = variants.filter(x => x.color?.toLowerCase() === v.color?.toLowerCase())
            .some(x => x.sku === selectedSku);
          const firstWithColor = variants.find(x => x.color?.toLowerCase() === v.color?.toLowerCase());
          return (
            <Link
              key={i}
              href={`/products/${firstWithColor!.slug}`}
              onClick={() => handleSkuSelect(firstWithColor!.sku)}
              className="group relative flex flex-col items-center gap-0.5"
            >
              <div
                className={`w-7 h-7 rounded-full border-2 transition-all group-hover:scale-110 flex items-center justify-center shadow-sm ${
                  isSelected ? 'ring-2 ring-accent-500 ring-offset-1 border-accent-500' : 'border-ink-200'
                }`}
                style={{ background: getColorBg(v.color, v.colorHex) }}
                title={v.color}
              >
                {isSelected && getColorBg(v.color, v.colorHex) !== 'transparent' && (
                  <Check className={`w-3.5 h-3.5 ${getColorBg(v.color, v.colorHex).toLowerCase().includes('white') || getColorBg(v.color, v.colorHex) === 'transparent' ? 'text-ink-700' : 'text-white'}`} />
                )}
              </div>
              <span className="text-[9px] text-ink-500 group-hover:text-navy-700 capitalize leading-none">{v.color}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  const renderPillGroup = (
    label: string,
    values: string[],
    icon: React.ReactNode
  ) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((val, i) => {
          const matchingVariants = variants.filter(v =>
            (v.size === val) || (v.capacity === val) || (v.layer === val)
          );
          const firstVariant = matchingVariants[0];
          if (!firstVariant) return null;
          const isSelected = matchingVariants.some(v => v.sku === selectedSku);
          return (
            <Link
              key={i}
              href={`/products/${firstVariant.slug}`}
              onClick={() => handleSkuSelect(firstVariant.sku)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                isSelected
                  ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
                  : 'bg-white text-ink-700 border-ink-200 hover:border-accent-300 hover:bg-accent-50'
              }`}
            >
              {val.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gradient-to-br from-accent-50/50 via-white to-navy-50/30 rounded-xl border border-accent-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-500" />
          <span className="text-sm font-bold text-navy-800">
            {variants.length} Styles Available
          </span>
        </div>
        <span className="text-[10px] text-ink-400 font-mono bg-ink-50 px-1.5 py-0.5 rounded">
          {parentSku}
        </span>
      </div>

      {/* Structured attribute selectors */}
      {hasStructuredData ? (
        <div className="space-y-3">
          {uniqueColors.length > 0 && renderColorSwatches()}
          {uniqueSizes.length > 0 && renderPillGroup('Size', uniqueSizes, <Maximize2 className="w-3.5 h-3.5 text-ink-400" />)}
          {uniqueCapacities.length > 0 && renderPillGroup('Capacity', uniqueCapacities, <Box className="w-3.5 h-3.5 text-ink-400" />)}
          {uniqueLayers.length > 0 && renderPillGroup('Layers', uniqueLayers, <Layers className="w-3.5 h-3.5 text-ink-400" />)}
          {uniqueMaterials.length > 1 && renderPillGroup('Material', uniqueMaterials, <Layers className="w-3.5 h-3.5 text-ink-400" />)}
        </div>
      ) : (
        // Fallback: image grid when no structured attributes
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {variants.map(v => (
            <Link
              key={v.sku}
              href={`/products/${v.slug}`}
              onClick={() => handleSkuSelect(v.sku)}
              className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                v.sku === selectedSku
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

      {/* Footer: current selection */}
      <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-ink-500 truncate">
          <span className="font-semibold text-navy-700">{currentVariant?.name}</span>
        </span>
        {currentVariant?.price > 0 && (
          <span className="text-sm font-bold text-accent-600 flex-shrink-0">
            ${currentVariant.price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
