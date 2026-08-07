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

  // Build pill labels: show ALL available features, prioritize color
  const getPillLabel = (v: Variant) => {
    const parts: string[] = [];
    
    // Color is the primary feature — always show if it exists
    if (v.color) parts.push(v.color);
    
    // Show size if it exists (either varies or is unique to this variant)
    if (v.size) parts.push(v.size);
    
    // Show capacity if it exists and isn't redundant with size
    if (v.capacity && !isSizeCapacityDup) parts.push(v.capacity);
    
    // Show layer if it exists
    if (v.layer) parts.push(v.layer);
    
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
    // Show capacity if available (even if same across all) for context
    if (v.capacity) return v.capacity;
    if (v.size) return v.size;
    
    // Extract any number/size from the variant name for identification
    const numMatch = v.name.match(/(\d+[-\s]?(?:ml|l|mm|cm|inch|in|layer|tiers?|pack|pcs?))/i);
    if (numMatch) return numMatch[1];
    
    // Use SKU suffix number
    const skuParts = v.sku.split('-');
    const num = skuParts[skuParts.length - 1];
    const numInt = parseInt(num, 10);
    if (!isNaN(numInt)) return `${v.capacity || ''} Variant ${numInt}`.trim() || `Variant ${numInt}`;
    return num;
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
