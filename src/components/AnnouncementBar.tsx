import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Truck, Shield, Globe2, Sparkles, TrendingUp } from 'lucide-react';

const messages = [
  { icon: Truck,     text: '🌍 Ships to 180+ Countries · Factory-Direct from Yiwu',  accent: 'bg-navy-800 text-white' },
  { icon: Shield,    text: '✓ Low MOQ 12 pcs · Wholesale Prices · Trade Assurance', accent: 'bg-gold-500 text-navy-900' },
  { icon: TrendingUp,text: '💰 Up to 60% Lower than Retail · New Arrivals Weekly',   accent: 'bg-coral-500 text-white' },
  { icon: Globe2,    text: '🤝 Sourcing partner for 4,000+ buyers worldwide',         accent: 'bg-navy-900 text-white' },
  { icon: Sparkles,  text: '✨ Customize & private label available for bulk orders',  accent: 'bg-gold-400 text-navy-900' },
];

const STORAGE_KEY = 'etruemart_announcement_dismissed';

const AnnouncementBar = () => {
  const [closed, setClosed] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') setClosed(true);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (closed) return;
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 3800);
    return () => clearInterval(t);
  }, [closed]);

  if (closed) return null;
  const m = messages[idx];
  const Icon = m.icon;

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-navy-700 text-white text-[12.5px] sm:text-sm">
      <div className="absolute inset-0 bg-dots-gold opacity-20 pointer-events-none" />
      <div className="section relative flex items-center justify-center h-10 gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center ring-1 ring-gold-400/40">
            <Icon className="w-3.5 h-3.5 text-gold-300" />
          </div>
        </div>
        <p
          key={idx}
          className="animate-fade-in font-medium tracking-tight text-center whitespace-nowrap text-ellipsis overflow-hidden"
        >
          <span className="sm:hidden"><Icon className="inline w-3.5 h-3.5 mr-1.5 -translate-y-0.5" /></span>
          {m.text}
        </p>
        <div className="hidden md:flex items-center gap-1 ml-2 shrink-0">
          {messages.map((_, i) => (
            <span
              key={i}
              className={`block h-1 w-1.5 rounded-full transition-all ${
                i === idx ? 'bg-gold-400 w-5' : 'bg-white/25'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            setClosed(true);
            try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
          }}
          className="absolute right-2 sm:right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
