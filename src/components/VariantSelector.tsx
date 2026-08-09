import { useState, useMemo } from 'react';
import Link from 'next/link';
import { colorToHex } from '@/lib/colors';

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

// Extract a short descriptive label from a variant name, stripping the base product name
function extractVariantLabel(name: string, baseName: string, sku: string): string {
  if (!name) return sku;
  
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  const nameWords = normalize(name).split(' ').filter(w => w.length > 1);
  const baseWords = normalize(baseName || '').split(' ').filter(w => w.length > 1);
  const baseWordSet = new Set(baseWords);
  
  // Remove words that appear in base name
  const uniqueWords = nameWords.filter(w => !baseWordSet.has(w));
  let label = uniqueWords.join(' ').trim();
  
  // STRIP capacity/size patterns (e.g. "500ml", "10cm", "3-layer", "4-tier", "100l")
  label = label.replace(/\d+\s*(?:ml|l|mm|cm|inch|in|layer|tier|tiers?|pack|pcs?|pieces?|set|count)\b/gi, '').trim();
  // Also strip standalone numbers with units that were split during normalization
  label = label.replace(/\b\d+(?:ml|l|mm|cm)\b/gi, '').trim();
  
  // Remove "N Colors" patterns and keep just meaningful text
  label = label.replace(/(\d+)\s*colors?/gi, '').trim();
  
  // If label is meaningful after stripping, capitalize and return
  if (label && label.length >= 2 && label !== 'colors') {
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  
  // Try extracting "N Colors" pattern from original name
  const colorMatch = name.match(/(\d+)\s*colors?/i);
  if (colorMatch) return `${colorMatch[1]} Colors`;
  
  // Try extracting color from the FULL variant name (not just unique words)
  const colorWords = ['white', 'black', 'red', 'blue', 'pink', 'green', 'purple', 'orange',
    'yellow', 'brown', 'gray', 'grey', 'gold', 'silver', 'beige', 'khaki', 'cream',
    'mint', 'navy', 'rose', 'lavender', 'turquoise', 'coral', 'ivory', 'teal', 'olive',
    'burgundy', 'tan', 'clear', 'transparent'];
  for (const c of colorWords) {
    const pattern = new RegExp(`\\b${c}\\b`, 'i');
    if (pattern.test(name)) return c.charAt(0).toUpperCase() + c.slice(1);
  }
  
  // If nothing meaningful found, use SKU number suffix as "Option N"
  const skuParts = sku.split('-');
  if (skuParts.length > 0) {
    const num = skuParts[skuParts.length - 1];
    const numInt = parseInt(num, 10);
    if (!isNaN(numInt)) return `Option ${numInt}`;
    return num;
  }
  
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

  // Analyze available features across all variants
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const uniqueCapacities = [...new Set(variants.map(v => v.capacity).filter(Boolean))];
  const uniqueLayers = [...new Set(variants.map(v => v.layer).filter(Boolean))];
  const hasAnyColor = uniqueColors.length >= 1;
  const hasAnySize = uniqueSizes.length >= 1;
  const hasAnyCapacity = uniqueCapacities.length >= 1;
  const hasAnyLayer = uniqueLayers.length >= 1;
  const sizesVary = uniqueSizes.length > 1;
  const capacitiesVary = uniqueCapacities.length > 1;
  const layersVary = uniqueLayers.length > 1;
  // If color repeats (same color appears for multiple variants), we need to differentiate
  const colorCounts = new Map<string, number>();
  variants.forEach(v => { if (v.color) colorCounts.set(v.color, (colorCounts.get(v.color) || 0) + 1); });
  const hasColorDup = Array.from(colorCounts.values()).some(c => c > 1);
  // If no size info anywhere but name suggests multi-size, assign shoe sizes
  const nameSuggestsMultiSize = variants.some(v => /multi[-\s]?size|size\s*\d/i.test(v.name || baseName || ''));

  // Assign shoe sizes to variants when: no structured size, names suggest shoes, multi-size
  const assignedSizesRef = useMemo(() => {
    const skuToSize: Record<string, string> = {};
    if (!hasAnySize && nameSuggestsMultiSize && variants.length > 0) {
      // Common shoe size range EU 36-44 for women/men unisex
      const shoeSizes = ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'];
      variants.forEach((v, i) => { skuToSize[v.sku] = shoeSizes[i % shoeSizes.length]; });
    }
    return skuToSize;
  }, [variants, hasAnySize, nameSuggestsMultiSize]);

  // Build pill labels: show ALL available features, prioritize color + differentiate duplicates
  const getPillLabel = (v: Variant) => {
    const effectiveSize = v.size || assignedSizesRef[v.sku] || '';
    const parts: string[] = [];
    
    // Color is the primary feature — always show if it exists
    if (v.color) parts.push(v.color);
    
    // Show size — either from variant data or shoe-size assignment
    if (effectiveSize) parts.push(effectiveSize);
    
    // Show capacity if it exists and isn't redundant with size
    if (v.capacity && !isSizeCapacityDup) parts.push(v.capacity);
    
    // Show layer if it exists
    if (v.layer) parts.push(v.layer);
    
    // If color repeats AND we don't have other differentiators, try to find a meaningful label
    // from the variant name (not meaningless SKU numbers)
    const skuParts = v.sku.split('-');
    const skuSuffix = skuParts[skuParts.length - 1];
    if (v.color && (colorCounts.get(v.color) || 0) > 1 && !effectiveSize && !v.capacity && !v.layer) {
      // Extract a meaningful differentiator from the variant name
      const nameDiff = extractVariantLabel(v.name, baseName, v.sku);
      // Only add if it's meaningful (not just a number or "Option N")
      const isOnlyNumbers = /^\d+$/.test(nameDiff);
      if (nameDiff && !isOnlyNumbers && !nameDiff.startsWith('Option ') && nameDiff.toLowerCase() !== (v.color || '').toLowerCase()) {
        parts.push(nameDiff);
      }
      // If no meaningful differentiator found, just show the color
      // (duplicate colors indicate a data issue - not adding SKU suffix as it's meaningless to users)
    }
    
    // If we have structured parts, use them directly
    if (parts.length > 0) {
      return parts.join(' / ');
    }
    
    // No structured fields — try extracting from variant name
    const extracted = extractVariantLabel(v.name, baseName, v.sku);
    if (extracted && extracted !== 'Option' && !extracted.startsWith('Option ')) {
      return extracted;
    }
    
    // Last resort: create a useful label from what we know
    if (effectiveSize) return effectiveSize;
    if (v.capacity) return v.capacity;
    if (v.size) return v.size;
    
    const numMatch = v.name.match(/(\d+[-\s]?(?:ml|l|mm|cm|inch|in|layer|tiers?|pack|pcs?))/i);
    if (numMatch) return numMatch[1];
    
    const numInt = parseInt(skuSuffix, 10);
    if (!isNaN(numInt)) return `Variant ${numInt}`;
    return skuSuffix;
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
