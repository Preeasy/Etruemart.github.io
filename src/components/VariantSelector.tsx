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

export default function VariantSelector({ variants, currentSku, baseName, parentSku }: Props) {
  const [selectedSku, setSelectedSku] = useState(currentSku);
  const currentVariant = variants.find(v => v.sku === currentSku) || variants[0];

  // Extract unique attribute values for grouped display
  const rawColors = [...new Map(
    variants.filter(v => v.color).map(v => [v.color!.toLowerCase(), v])
  ).values()];
  const rawSizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];
  const rawCapacities = [...new Set(variants.map(v => v.capacity).filter(Boolean))] as string[];
  const uniqueLayers = [...new Set(variants.map(v => v.layer).filter(Boolean))] as string[];

  // ===== Frontend de-dupe: if SIZE and CAPACITY have the same values, drop CAPACITY =====
  const setsEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.map(x => x.toLowerCase()).every(v => b.map(y => y.toLowerCase()).includes(v));
  const isSizeCapacityDup = rawSizes.length > 0 && rawCapacities.length > 0 && setsEqual(rawSizes, rawCapacities);

  const uniqueColors = rawColors;
  const uniqueSizes = rawSizes;
  const uniqueCapacities = isSizeCapacityDup ? [] : rawCapacities;

  // Determine rendering mode:
  // If multiple colors exist → use color-based card grid (yeatru.com style)
  // If only size/capacity/layer vary → use attribute pill groups
  const useCardGrid = uniqueColors.length >= 2;

  const handleSkuSelect = (sku: string) => {
    setSelectedSku(sku);
  };

  // Fallback SVG for missing images
  const fallbackSvg = (label: string) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="#f3f4f6" width="200" height="200"/><text x="100" y="105" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">${label}</text></svg>`
    )}`;

  // ===== YEATRU-STYLE: Color variant cards (primary visual) =====
  const renderColorCardGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {variants.map((v, i) => {
        const isSelected = v.sku === currentSku;
        return (
          <Link
            key={`${v.sku}-${i}`}
            href={`/products/${v.slug}`}
            onClick={() => handleSkuSelect(v.sku)}
            className={`group relative block rounded-xl border-2 transition-all overflow-hidden bg-white ${
              isSelected
                ? 'border-accent-500 ring-2 ring-accent-100 shadow-md'
                : 'border-ink-200 hover:border-accent-300 hover:shadow-sm'
            }`}
          >
            {/* Selected checkmark badge */}
            {isSelected && (
              <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-accent-600 text-white flex items-center justify-center shadow-sm">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Variant thumbnail */}
            <div className="relative aspect-square bg-ink-50">
              <img
                src={v.image}
                alt={v.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (!el.dataset.fallback) {
                    el.dataset.fallback = '1';
                    el.src = fallbackSvg(v.color || v.size || 'Variant');
                  }
                }}
              />
            </div>

            {/* Info strip */}
            <div className="p-2 border-t border-ink-100">
              <div className="flex items-center justify-between gap-1 mb-1">
                {v.color && (
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-ink-300 flex-shrink-0"
                      style={{
                        backgroundColor: v.colorHex ||
                          (v.color.toLowerCase().includes('white') ? '#fff' :
                           v.color.toLowerCase().includes('black') ? '#1f2937' :
                           v.color.toLowerCase().includes('navy') ? '#1e3a5f' :
                           v.color.toLowerCase().includes('beige') ? '#e7d4b5' :
                           v.color.toLowerCase().includes('khaki') ? '#b5a678' :
                           v.color.toLowerCase().includes('cream') ? '#fef3c7' :
                           v.color.toLowerCase().includes('brown') ? '#92400e' :
                           v.color.toLowerCase().includes('gold') ? '#d4af37' :
                           v.color.toLowerCase().includes('silver') ? '#c0c0c0' :
                           '#d1d5db'),
                      }}
                    />
                    <span className="text-[11px] font-semibold text-navy-800 truncate">{v.color}</span>
                  </div>
                )}
                {!v.color && v.size && (
                  <span className="text-[11px] font-bold text-navy-800 truncate">{v.size}</span>
                )}
                <span className="text-[11px] font-bold text-accent-700 flex-shrink-0">
                  ${v.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-ink-400 truncate">{v.sku}</span>
                <span className={`text-[9px] font-semibold ${v.stock > 0 ? 'text-success-600' : 'text-red-500'}`}>
                  {v.stock > 0 ? 'In Stock' : 'Out'}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );

  // ===== FALLBACK: Pill groups for non-color attributes =====
  const renderPillGroups = () => {
    const rows: { label: string; values: string[]; matchKey: 'size' | 'capacity' | 'layer' | 'material' }[] = [];
    if (uniqueColors.length > 0) {
      // Single color but still display as label
      return null;
    }
    if (uniqueSizes.length > 1) rows.push({ label: 'Size', values: uniqueSizes, matchKey: 'size' });
    if (uniqueCapacities.length > 1) rows.push({ label: 'Capacity', values: uniqueCapacities, matchKey: 'capacity' });
    if (uniqueLayers.length > 1) rows.push({ label: 'Layers', values: uniqueLayers, matchKey: 'layer' });

    return rows.length > 0 ? (
      <div className="space-y-2">
        {rows.map((row, ri) => (
          <div key={ri}>
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1 block">{row.label}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {row.values.map((val, i) => {
                const matchVar = variants.find(v => v[row.matchKey] === val);
                if (!matchVar) return null;
                const isSel = matchVar.sku === currentSku;
                return (
                  <Link
                    key={i}
                    href={`/products/${matchVar.slug}`}
                    onClick={() => handleSkuSelect(matchVar.sku)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      isSel
                        ? 'bg-accent-600 text-white border-accent-600 shadow-sm'
                        : 'bg-white text-ink-700 border-ink-200 hover:border-accent-300 hover:bg-accent-50'
                    }`}
                  >
                    {val}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    ) : null;
  };

  if (variants.length === 0) return null;

  return (
    <div className="py-3 border-b border-ink-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-accent-500" />
          <span className="text-xs font-bold text-navy-800">{variants.length} {variants.length > 1 ? 'Styles' : 'Style'} Available</span>
        </div>
        <span className="text-[10px] text-ink-400 font-mono bg-ink-50 px-2 py-0.5 rounded">
          {parentSku}
        </span>
      </div>

      {useCardGrid ? renderColorCardGrid() : renderPillGroups()}

      {/* Footer: current selection summary */}
      <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-ink-50 border border-ink-100">
        <div className="flex items-center gap-2 min-w-0">
          {currentVariant?.image && (
            <img
              src={currentVariant.image}
              alt=""
              className="w-8 h-8 rounded object-contain bg-white border border-ink-200 flex-shrink-0"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                if (!el.dataset.fallback) {
                  el.dataset.fallback = '1';
                  el.src = fallbackSvg('v');
                }
              }}
            />
          )}
          <span className="text-[11px] text-ink-600 truncate">
            <span className="font-bold text-navy-800">Selected:</span> {currentVariant?.name || baseName}
          </span>
        </div>
        {currentVariant?.price > 0 && (
          <span className="text-sm font-extrabold text-accent-700 flex-shrink-0">
            ${currentVariant.price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
