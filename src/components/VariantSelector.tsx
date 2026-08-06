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

function getColorBg(color?: string | null, hex?: string): string {
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

  const handleSkuSelect = (sku: string) => {
    setSelectedSku(sku);
  };

  const renderColorSwatches = () => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {uniqueColors.map((v, i) => {
        const isSelected = variants.filter(x => x.color?.toLowerCase() === v.color?.toLowerCase())
          .some(x => x.sku === selectedSku);
        const firstWithColor = variants.find(x => x.color?.toLowerCase() === v.color?.toLowerCase());
        if (!firstWithColor) return null;
        return (
          <Link
            key={i}
            href={`/products/${firstWithColor.slug}`}
            onClick={() => handleSkuSelect(firstWithColor.sku)}
            className="group relative flex items-center"
            title={v.color || ''}
          >
            <div
              className={`w-6 h-6 rounded-full border-1.5 transition-all group-hover:scale-110 flex items-center justify-center ${
                isSelected ? 'ring-1.5 ring-accent-500 ring-offset-0.5 border-accent-500' : 'border-ink-200'
              }`}
              style={{ background: getColorBg(v.color, v.colorHex) }}
            >
              {isSelected && getColorBg(v.color, v.colorHex) !== 'transparent' && (
                <Check className={`w-3 h-3 ${getColorBg(v.color, v.colorHex).toLowerCase().includes('white') || getColorBg(v.color, v.colorHex) === 'transparent' ? 'text-ink-700' : 'text-white'}`} />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  const renderPillGroup = (
    values: string[],
  ) => (
    <div className="flex items-center gap-1 flex-wrap">
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
            className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-all ${
              isSelected
                ? 'bg-accent-500 text-white border-accent-500'
                : 'bg-white text-ink-700 border-ink-200 hover:border-accent-300'
            }`}
          >
            {val.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );

  const renderMaterialGroup = () => (
    <div className="flex items-center gap-1 flex-wrap">
      {uniqueMaterials.map((m, i) => {
        const matchingVariants = variants.filter(v => v.material === m);
        const firstVariant = matchingVariants[0];
        if (!firstVariant) return null;
        const isSelected = matchingVariants.some(v => v.sku === selectedSku);
        return (
          <Link
            key={i}
            href={`/products/${firstVariant.slug}`}
            onClick={() => handleSkuSelect(firstVariant.sku)}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-all ${
              isSelected
                ? 'bg-navy-700 text-white border-navy-700'
                : 'bg-white text-ink-700 border-ink-200 hover:border-navy-400'
            }`}
          >
            {m}
          </Link>
        );
      })}
    </div>
  );

  // Collect active dimension rows
  const rows: { label: string; content: React.ReactNode }[] = [];
  if (uniqueColors.length > 0) rows.push({ label: 'Color', content: renderColorSwatches() });
  if (uniqueSizes.length > 0) rows.push({ label: 'Size', content: renderPillGroup(uniqueSizes) });
  if (uniqueCapacities.length > 0) rows.push({ label: 'Capacity', content: renderPillGroup(uniqueCapacities) });
  if (uniqueLayers.length > 0) rows.push({ label: 'Layers', content: renderPillGroup(uniqueLayers) });
  if (uniqueMaterials.length > 1) rows.push({ label: 'Material', content: renderMaterialGroup() });

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="py-2 border-b border-ink-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent-500" />
          <span className="text-xs font-bold text-navy-800">{variants.length} Styles Available</span>
        </div>
        <span className="text-[9px] text-ink-400 font-mono bg-ink-50 px-1.5 py-0.5 rounded">
          {parentSku}
        </span>
      </div>

      {/* Dimension rows - only show if they have options */}
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider w-14 flex-shrink-0">{row.label}</span>
            <div className="flex-1">{row.content}</div>
          </div>
        ))}
      </div>

      {/* Footer: current selection */}
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-ink-500 truncate">
          <span className="font-semibold text-navy-700">{currentVariant?.name}</span>
        </span>
        {currentVariant?.price > 0 && (
          <span className="font-bold text-accent-600 flex-shrink-0">
            ${currentVariant.price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
