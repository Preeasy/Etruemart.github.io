import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

interface Variant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  color?: string;
  size?: string;
}

interface Props {
  variants: Variant[];
  currentSku: string;
  baseName: string;
  parentSku: string;
}

const colorMap: Record<string, { bg: string; label: string }> = {
  black: { bg: 'bg-gray-900', label: 'Black' },
  white: { bg: 'bg-white border-2 border-gray-300', label: 'White' },
  red: { bg: 'bg-red-500', label: 'Red' },
  blue: { bg: 'bg-blue-500', label: 'Blue' },
  pink: { bg: 'bg-pink-400', label: 'Pink' },
  green: { bg: 'bg-green-500', label: 'Green' },
  purple: { bg: 'bg-purple-500', label: 'Purple' },
  orange: { bg: 'bg-orange-500', label: 'Orange' },
  yellow: { bg: 'bg-yellow-400', label: 'Yellow' },
  brown: { bg: 'bg-amber-700', label: 'Brown' },
  gray: { bg: 'bg-gray-400', label: 'Gray' },
  grey: { bg: 'bg-gray-400', label: 'Gray' },
  gold: { bg: 'bg-yellow-600', label: 'Gold' },
  silver: { bg: 'bg-gray-300', label: 'Silver' },
  beige: { bg: 'bg-amber-200', label: 'Beige' },
  clear: { bg: 'bg-transparent border-2 border-gray-300', label: 'Clear' },
  mint: { bg: 'bg-teal-300', label: 'Mint' },
  navy: { bg: 'bg-blue-900', label: 'Navy' },
  rose: { bg: 'bg-rose-400', label: 'Rose' },
};

function getColorStyle(color?: string) {
  if (!color) return null;
  const key = color.toLowerCase();
  return colorMap[key] || null;
}

export default function VariantSelector({ variants, currentSku, baseName, parentSku }: Props) {
  const [selectedSku, setSelectedSku] = useState(currentSku);

  const currentVariant = variants.find(v => v.sku === currentSku) || variants[0];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];

  return (
    <div className="mt-4 p-4 bg-navy-50/50 rounded-xl border border-navy-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-navy-800">
          {variants.length} styles available
        </span>
        <span className="text-xs text-ink-500">
          Parent Item: {parentSku}
        </span>
      </div>

      {/* Color selector */}
      {colors.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-ink-500 mb-2 uppercase tracking-wide">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => {
              const style = getColorStyle(color);
              const matchingVariants = variants.filter(v => v.color === color);
              const isAvailable = matchingVariants.some(v => v.stock > 0);
              const firstVariant = matchingVariants[0];
              if (!firstVariant) return null;

              const isSelected = matchingVariants.some(v => v.sku === selectedSku);

              return (
                <Link
                  key={color}
                  href={`/products/${firstVariant.slug}`}
                  className={`group relative flex flex-col items-center gap-1 ${
                    !isAvailable ? 'opacity-40 pointer-events-none' : ''
                  }`}
                  onClick={() => setSelectedSku(firstVariant.sku)}
                >
                  <div className={`w-8 h-8 rounded-full ${style?.bg || 'bg-gray-400'} ${
                    isSelected ? 'ring-2 ring-accent-500 ring-offset-2' : ''
                  } transition-all group-hover:scale-110 flex items-center justify-center`}>
                    {isSelected && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-[10px] text-ink-500 group-hover:text-navy-700">
                    {style?.label || color}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-500 mb-2 uppercase tracking-wide">Size / Specification</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              const matchingVariants = variants.filter(v => v.size === size);
              const isAvailable = matchingVariants.some(v => v.stock > 0);
              const firstVariant = matchingVariants[0];
              if (!firstVariant) return null;

              const isSelected = matchingVariants.some(v => v.sku === selectedSku);

              return (
                <Link
                  key={size}
                  href={`/products/${firstVariant.slug}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                    isSelected
                      ? 'bg-accent-500 text-white border-accent-500'
                      : 'bg-white text-ink-700 border-ink-200 hover:border-accent-300 hover:bg-accent-50'
                  } ${!isAvailable ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {size.toUpperCase()}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* All variants grid */}
      {!colors.length && !sizes.length && (
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
        <span className="text-xs text-ink-500">
          Showing: {currentVariant?.name}
        </span>
        {currentVariant?.price > 0 && (
          <span className="text-sm font-bold text-accent-600">
            ${currentVariant.price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
