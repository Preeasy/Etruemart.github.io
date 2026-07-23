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
];

// Order matters: longer patterns first to avoid partial replacements
const replacements = [
  // Backgrounds with opacity (longest first)
  { from: 'bg-dark-800/50', to: 'bg-gray-50' },
  { from: 'bg-dark-900/95', to: 'bg-white/95' },
  { from: 'bg-dark-900/90', to: 'bg-white/90' },
  { from: 'bg-dark-900/80', to: 'bg-white/80' },
  { from: 'bg-dark-900/50', to: 'bg-white/50' },
  { from: 'bg-dark-900/40', to: 'bg-white/40' },
  { from: 'bg-dark-900/30', to: 'bg-white/30' },
  { from: 'bg-dark-900/10', to: 'bg-white/10' },
  { from: 'bg-dark-900', to: 'bg-white' },
  { from: 'bg-dark-800', to: 'bg-gray-50' },

  // Borders
  { from: 'border-dark-700/50', to: 'border-gray-200' },
  { from: 'border-dark-700/30', to: 'border-gray-100' },

  // Text (longest patterns first)
  { from: 'text-dark-50', to: 'text-gray-900' },
  { from: 'text-dark-200', to: 'text-gray-600' },
  { from: 'text-dark-300', to: 'text-gray-500' },
  { from: 'text-dark-400', to: 'text-gray-500' },
  { from: 'text-dark-600', to: 'text-gray-400' },

  // Gradients
  { from: 'from-dark-800', to: 'from-gray-50' },
  { from: 'via-dark-800', to: 'via-gray-50' },
  { from: 'from-dark-900', to: 'from-white' },
  { from: 'via-dark-900', to: 'via-white' },
  { from: 'to-dark-950', to: 'to-gray-100' },
  { from: 'to-dark-900', to: 'to-white' },

  // Gold adjustments (longest first)
  { from: 'hover:text-gold-400', to: 'hover:text-gold-500' },
  { from: 'text-gold-400', to: 'text-gold-600' },
  { from: 'bg-gold-500/15', to: 'bg-gold-50' },
  { from: 'bg-gold-500/20', to: 'bg-gold-100' },
  { from: 'bg-gold-500/10', to: 'bg-gold-50' },
  { from: 'bg-gold-500/5', to: 'bg-gold-50' },
  { from: 'border-gold-500/50', to: 'border-gold-300' },
  { from: 'border-gold-500/40', to: 'border-gold-300' },
  { from: 'border-gold-500/30', to: 'border-gold-200' },
  { from: 'border-gold-500/20', to: 'border-gold-200' },
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
    // Escape special regex characters
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match as a Tailwind class: preceded by space, quote, or bracket; followed by space, quote, or bracket
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
