import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Truck, Tag, Globe } from 'lucide-react';

const messages = [
  { icon: Truck, text: 'Minimum order $100 · Wholesale only' },
  { icon: Globe, text: 'Factory-direct from Yiwu · Ships to 180+ countries' },
  { icon: Tag, text: 'Low MOQ from 12 pcs · Factory-direct pricing' },
];

const STORAGE_KEY = 'etruemart_announcement_dismissed';

const AnnouncementBar = () => {
  const [closed, setClosed] = useState(false);
  const [idx, setIdx] = useState(0);

  // Persist dismissal across the session so it doesn't nag the user
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') setClosed(true);
    } catch { /* ignore storage errors (private mode, etc.) */ }
  }, []);

  // Rotate messages every ~4.5s for a compact rotating bar
  useEffect(() => {
    if (closed) return;
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [closed]);

  const dismiss = () => {
    setClosed(true);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  };

  if (closed) return null;

  const Msg = messages[idx];
  const Icon = Msg.icon;

  return (
    <div className="bg-navy-900 text-white text-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-9 gap-3">
          {/* Rotating message */}
          <div className="flex-1 min-w-0 flex items-center justify-center md:justify-start">
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-white/95 hover:text-accent-300 transition-colors font-medium truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon className="w-3.5 h-3.5 text-accent-400 shrink-0" />
              <span className="truncate">{Msg.text}</span>
            </Link>
          </div>

          {/* Quick links — desktop only */}
          <div className="hidden md:flex items-center gap-4 text-white/70">
            <Link href="/about" className="hover:text-accent-300 transition-colors">About</Link>
            <Link href="/about" className="hover:text-accent-300 transition-colors">Help</Link>
            <Link href="/register" className="hover:text-accent-300 transition-colors">Become a Buyer</Link>
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="p-1 -mr-1 text-white/60 hover:text-white transition-colors rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
