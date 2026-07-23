const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/index.tsx',
  'src/pages/sell.tsx',
  'src/components/Footer.tsx',
  'src/components/Navbar.tsx',
  'src/pages/dashboard.tsx',
  'src/pages/login.tsx',
  'src/pages/products/index.tsx',
  'src/pages/products/[id].tsx',
  'src/pages/register.tsx',
  'src/components/ProductCard.tsx',
  'src/styles/globals.css',
  'src/pages/globals.css',
  'src/pages/cart.tsx',
  'src/pages/orders.tsx',
];

// Order matters: longest patterns first
const replacements = [
  // Placeholder colors
  { from: 'placeholder-dark-500', to: 'placeholder-gray-400' },

  // Text colors (longest first)
  { from: 'text-dark-100', to: 'text-gray-900' },
  { from: 'text-dark-200', to: 'text-gray-700' },
  { from: 'text-dark-300', to: 'text-gray-600' },
  { from: 'text-dark-400', to: 'text-gray-500' },
  { from: 'text-dark-500', to: 'text-gray-500' },
  { from: 'text-dark-600', to: 'text-gray-400' },
  { from: 'text-dark-700', to: 'text-gray-400' },
  { from: 'text-dark-800', to: 'text-gray-600' },
  { from: 'text-dark-900', to: 'text-white' },
  { from: 'text-dark-50', to: 'text-gray-900' },

  // Background colors with opacity
  { from: 'bg-dark-900/95', to: 'bg-white/95' },
  { from: 'bg-dark-900/90', to: 'bg-white/90' },
  { from: 'bg-dark-900/80', to: 'bg-white/80' },
  { from: 'bg-dark-900/70', to: 'bg-white/70' },
  { from: 'bg-dark-900/60', to: 'bg-white/60' },
  { from: 'bg-dark-900/50', to: 'bg-white/50' },
  { from: 'bg-dark-900/40', to: 'bg-white/40' },
  { from: 'bg-dark-900/30', to: 'bg-white/30' },
  { from: 'bg-dark-900/20', to: 'bg-white/20' },
  { from: 'bg-dark-900/10', to: 'bg-white/10' },
  { from: 'bg-dark-900/5', to: 'bg-white/5' },
  { from: 'bg-dark-800/95', to: 'bg-gray-50/95' },
  { from: 'bg-dark-800/90', to: 'bg-gray-50/90' },
  { from: 'bg-dark-800/80', to: 'bg-gray-50/80' },
  { from: 'bg-dark-800/70', to: 'bg-gray-50/70' },
  { from: 'bg-dark-800/60', to: 'bg-gray-50/60' },
  { from: 'bg-dark-800/50', to: 'bg-gray-50/50' },
  { from: 'bg-dark-800/40', to: 'bg-gray-50/40' },
  { from: 'bg-dark-800/30', to: 'bg-gray-50/30' },
  { from: 'bg-dark-800/20', to: 'bg-gray-50/20' },
  { from: 'bg-dark-800/10', to: 'bg-gray-50/10' },
  { from: 'bg-dark-800/5', to: 'bg-gray-50/5' },
  { from: 'bg-dark-700/95', to: 'bg-gray-100/95' },
  { from: 'bg-dark-700/90', to: 'bg-gray-100/90' },
  { from: 'bg-dark-700/80', to: 'bg-gray-100/80' },
  { from: 'bg-dark-700/70', to: 'bg-gray-100/70' },
  { from: 'bg-dark-700/60', to: 'bg-gray-100/60' },
  { from: 'bg-dark-700/50', to: 'bg-gray-100/50' },
  { from: 'bg-dark-700/40', to: 'bg-gray-100/40' },
  { from: 'bg-dark-700/30', to: 'bg-gray-100/30' },
  { from: 'bg-dark-700/20', to: 'bg-gray-100/20' },
  { from: 'bg-dark-700/10', to: 'bg-gray-100/10' },
  { from: 'bg-dark-700/5', to: 'bg-gray-100/5' },
  { from: 'bg-dark-600/95', to: 'bg-gray-200/95' },
  { from: 'bg-dark-600/90', to: 'bg-gray-200/90' },
  { from: 'bg-dark-600/80', to: 'bg-gray-200/80' },
  { from: 'bg-dark-600/70', to: 'bg-gray-200/70' },
  { from: 'bg-dark-600/60', to: 'bg-gray-200/60' },
  { from: 'bg-dark-600/50', to: 'bg-gray-200/50' },
  { from: 'bg-dark-600/40', to: 'bg-gray-200/40' },
  { from: 'bg-dark-600/30', to: 'bg-gray-200/30' },
  { from: 'bg-dark-600/20', to: 'bg-gray-200/20' },
  { from: 'bg-dark-600/10', to: 'bg-gray-200/10' },
  { from: 'bg-dark-600/5', to: 'bg-gray-200/5' },
  { from: 'bg-dark-500/95', to: 'bg-gray-300/95' },
  { from: 'bg-dark-500/90', to: 'bg-gray-300/90' },
  { from: 'bg-dark-500/80', to: 'bg-gray-300/80' },
  { from: 'bg-dark-500/70', to: 'bg-gray-300/70' },
  { from: 'bg-dark-500/60', to: 'bg-gray-300/60' },
  { from: 'bg-dark-500/50', to: 'bg-gray-300/50' },
  { from: 'bg-dark-500/40', to: 'bg-gray-300/40' },
  { from: 'bg-dark-500/30', to: 'bg-gray-300/30' },
  { from: 'bg-dark-500/20', to: 'bg-gray-300/20' },
  { from: 'bg-dark-500/10', to: 'bg-gray-300/10' },
  { from: 'bg-dark-500/5', to: 'bg-gray-300/5' },

  // Solid backgrounds
  { from: 'bg-dark-950', to: 'bg-gray-100' },
  { from: 'bg-dark-900', to: 'bg-white' },
  { from: 'bg-dark-800', to: 'bg-gray-50' },
  { from: 'bg-dark-700', to: 'bg-gray-100' },
  { from: 'bg-dark-600', to: 'bg-gray-200' },
  { from: 'bg-dark-500', to: 'bg-gray-300' },
  { from: 'bg-dark-400', to: 'bg-gray-400' },
  { from: 'bg-dark-300', to: 'bg-gray-500' },
  { from: 'bg-dark-200', to: 'bg-gray-600' },
  { from: 'bg-dark-100', to: 'bg-gray-700' },
  { from: 'bg-dark-50', to: 'bg-gray-800' },

  // Borders with opacity
  { from: 'border-dark-900/95', to: 'border-white/95' },
  { from: 'border-dark-900/50', to: 'border-white/50' },
  { from: 'border-dark-900/30', to: 'border-white/30' },
  { from: 'border-dark-900/20', to: 'border-white/20' },
  { from: 'border-dark-800/50', to: 'border-gray-50/50' },
  { from: 'border-dark-800/30', to: 'border-gray-50/30' },
  { from: 'border-dark-700/50', to: 'border-gray-100/50' },
  { from: 'border-dark-700/40', to: 'border-gray-100/40' },
  { from: 'border-dark-700/30', to: 'border-gray-100/30' },
  { from: 'border-dark-700/20', to: 'border-gray-100/20' },
  { from: 'border-dark-600/50', to: 'border-gray-200/50' },
  { from: 'border-dark-600/40', to: 'border-gray-200/40' },
  { from: 'border-dark-600/30', to: 'border-gray-200/30' },
  { from: 'border-dark-500/50', to: 'border-gray-300/50' },
  { from: 'border-dark-500/40', to: 'border-gray-300/40' },
  { from: 'border-dark-500/30', to: 'border-gray-300/30' },
  { from: 'border-dark-500/20', to: 'border-gray-300/20' },

  // Solid borders
  { from: 'border-dark-900', to: 'border-white' },
  { from: 'border-dark-800', to: 'border-gray-50' },
  { from: 'border-dark-700', to: 'border-gray-100' },
  { from: 'border-dark-600', to: 'border-gray-200' },
  { from: 'border-dark-500', to: 'border-gray-300' },
  { from: 'border-dark-400', to: 'border-gray-400' },

  // Gradients
  { from: 'from-dark-950', to: 'from-gray-100' },
  { from: 'from-dark-900', to: 'from-white' },
  { from: 'from-dark-800', to: 'from-gray-50' },
  { from: 'from-dark-700', to: 'from-gray-100' },
  { from: 'via-dark-950', to: 'via-gray-100' },
  { from: 'via-dark-900', to: 'via-white' },
  { from: 'via-dark-800', to: 'via-gray-50' },
  { from: 'via-dark-700', to: 'via-gray-100' },
  { from: 'to-dark-950', to: 'to-gray-100' },
  { from: 'to-dark-900', to: 'to-white' },
  { from: 'to-dark-800', to: 'to-gray-50' },
  { from: 'to-dark-700', to: 'to-gray-100' },

  // Ring focus
  { from: 'ring-gold-500/30', to: 'ring-gold-500/30' }, // keep
  { from: 'ring-dark-500/30', to: 'ring-gray-300/30' },

  // Specific problematic colors that need manual handling
  { from: 'hover:bg-dark-600', to: 'hover:bg-gray-200' },
  { from: 'hover:bg-dark-700', to: 'hover:bg-gray-100' },
  { from: 'hover:bg-dark-800', to: 'hover:bg-gray-50' },

  // Gold adjustments (text-gold-400 on dark was replaced before, fix for light)
  { from: 'text-gold-300', to: 'text-gold-600' },
  { from: 'text-gold-400', to: 'text-gold-600' },
  { from: 'text-gold-500', to: 'text-gold-600' },
  { from: 'hover:text-gold-300', to: 'hover:text-gold-500' },
  { from: 'hover:text-gold-400', to: 'hover:text-gold-500' },
  { from: 'hover:text-gold-500', to: 'hover:text-gold-600' },
  { from: 'bg-gold-800/50', to: 'bg-gold-100' },
  { from: 'bg-gold-700/30', to: 'bg-gold-100' },
  { from: 'border-gold-700/30', to: 'border-gold-200' },

  // Input text fixes
  { from: 'text-gray-900', to: 'text-gray-900' }, // keep
  { from: 'text-gray-600', to: 'text-gray-700' }, // improve contrast
];

files.forEach(file => {
  const filePath = path.join('/workspace', file);
  if (!fs.existsSync(filePath)) {
    console.log('Skip (not found):', file);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  replacements.forEach(({ from, to }) => {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=['"\\s])${escaped}(?=['"\\s])`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', file);
  } else {
    console.log('No changes:', file);
  }
});
