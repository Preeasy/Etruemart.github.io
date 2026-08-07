import { useState } from 'react';
import Link from 'next/link';

interface Variant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  moq?: number;
  color?: string | null;
  colorHex?: string | null;
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
  onVariantSelect?: (variant: Variant) => void;
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

// Extract a short descriptive label from a variant name, stripping the base product name
function extractVariantLabel(name: string, baseName: string, sku: string): string {
  if (!name) return sku;
  
  // Strategy: remove common words/parts from the variant name that appear in the base name
  // Split both names into words and remove common words from the variant name
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  const nameWords = normalize(name).split(' ').filter(w => w.length > 1);
  const baseWords = normalize(baseName || '').split(' ').filter(w => w.length > 1);
  const baseWordSet = new Set(baseWords);
  
  // Remove words that appear in base name
  const uniqueWords = nameWords.filter(w => !baseWordSet.has(w));
  
  // Clean up the remaining words
  let label = uniqueWords.join(' ').trim();
  
  // Remove numbers with "colors" / "color" suffix (like "2 Colors", "3 Colors") - keep just the number
  label = label.replace(/(\d+)\s*colors?/gi, '$1 Colors').trim();
  
  // If label is meaningful, capitalize and return
  if (label && label.length >= 1 && label !== 'colors') {
    // Capitalize first letter
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  
  // Try simpler approach: just extract the number+colors pattern from the original name
  const colorMatch = name.match(/(\d+)\s*colors?/i);
  if (colorMatch) return `${colorMatch[1]} Colors`;
  
  // Fallback: use color from variant name if present
  const colorWords = ['white', 'black', 'red', 'blue', 'pink', 'green', 'purple', 'orange',
    'yellow', 'brown', 'gray', 'grey', 'gold', 'silver', 'beige', 'khaki', 'cream'];
  for (const c of colorWords) {
    const pattern = new RegExp(`\\b${c}\\b`, 'i');
    if (pattern.test(name)) return c.charAt(0).toUpperCase() + c.slice(1);
  }
  
  // Last fallback: use last part of SKU
  const skuParts = sku.split('-');
  if (skuParts.length > 0) return skuParts[skuParts.length - 1];
  
  return sku;
}

export default function VariantSelector({ variants, currentSku, baseName, onVariantSelect }: Props) {
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
    
    if (parts.length > 0) {
      return parts.join(' + ');
    }
    
    // No structured fields — extract meaningful label from name
    return extractVariantLabel(v.name, baseName, v.sku);
  };

  const handleVariantClick = (v: Variant, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedSku(v.sku);
    if (onVariantSelect) {
      onVariantSelect(v);
    }
  };

  if (variants.length === 0) return null;

  return (
    <div>
      {/* Pill-style variant chips */}
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.sku === currentSku || v.sku === selectedSku;
          const label = getPillLabel(v);
          return (
            <Link
              key={v.sku}
              href={`/products/${v.slug}`}
              onClick={(e) => handleVariantClick(v, e)}
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
