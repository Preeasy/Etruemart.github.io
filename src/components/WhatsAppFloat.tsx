import { useState, useEffect } from 'react';
import { X, Send, Gem, MessageSquare } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const WHATSAPP_NUMBER = '8618767960499';
const WHATSAPP_DISPLAY = '+86 187 6796 0499';
const DEFAULT_MSG = 'Hello! I am interested in your wholesale products. Could you send me a price list and MOQ details?';

const WhatsAppFloat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [msg, setMsg] = useState(DEFAULT_MSG);

  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isOpen) setShowBubble(false);
  }, [isOpen]);

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  return (
    <>
      {/* ---------- Notification bubble ---------- */}
      {showBubble && !isOpen && (
        <div
          onClick={() => { setShowBubble(false); setIsOpen(true); }}
          className="fixed bottom-28 right-4 sm:right-7 z-40 w-[260px] max-w-[calc(100vw-5rem)] cursor-pointer"
        >
          <div className="relative bg-white rounded-2xl shadow-premium border border-sand-200 p-4 rise-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shadow-md">
                <WhatsAppIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-navy-900 leading-tight">Live Sales Manager</p>
                <p className="text-[9.5px] text-success-600 font-semibold leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
                  Online now · Replies in minutes
                </p>
              </div>
            </div>
            <p className="text-xs text-ink-700 leading-relaxed">
              👋 Hi there! Looking for <span className="font-bold text-gold-700">wholesale prices</span>?
              Chat with us directly for an instant quote.
            </p>
            <div
              className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 bg-white border-b border-r border-sand-200"
              aria-hidden
            />
          </div>
        </div>
      )}

      {/* ---------- Chat Panel ---------- */}
      {isOpen && (
        <div className="fixed bottom-28 right-4 sm:right-7 z-50 w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-premium border border-sand-200 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-navy-800 via-navy-800 to-[#0a1a2e] text-white px-5 pt-4 pb-5 overflow-hidden">
            <div className="absolute inset-0 bg-hero-texture opacity-80 pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center shadow-navy-glow">
                    <Gem className="w-6 h-6 text-gold-300" strokeWidth={2.2} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#25D366] border-2 border-navy-800 flex items-center justify-center">
                    <WhatsAppIcon className="w-2.5 h-2.5 text-white" />
                  </span>
                </div>
                <div className="leading-tight">
                  <p className="font-display font-extrabold text-[17px] text-white">
                    eTrue<span className="text-gold-gradient">Mart</span> Sales
                  </p>
                  <p className="text-[11px] text-navy-100/80 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
                    Online · {WHATSAPP_DISPLAY}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Messages stack */}
          <div className="px-5 py-4 bg-sand-50/80 space-y-3 max-h-[300px] overflow-y-auto">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center shrink-0">
                <Gem className="w-3.5 h-3.5 text-gold-300" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm border border-sand-200 shadow-paper p-3 max-w-[80%]">
                <p className="text-[11px] text-gold-700 font-black mb-1">Etruemart Sales</p>
                <p className="text-xs text-ink-700 leading-relaxed">
                  Thank you for visiting! 🌟
                  <br/>
                  Tell us what you need — <strong className="text-navy-900">product name, SKU or category</strong> and your target quantity, we&apos;ll send the best wholesale price instantly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center shrink-0 border border-gold-200">
                <MessageSquare className="w-3.5 h-3.5 text-gold-700" />
              </div>
              <div className="bg-gold-50 rounded-2xl rounded-tl-sm border border-gold-200 shadow-paper p-3 max-w-[80%]">
                <ul className="text-xs text-ink-700 space-y-1 list-none">
                  <li className="flex gap-1.5"><span className="text-gold-600">✓</span> MOQ starts at 12 pcs</li>
                  <li className="flex gap-1.5"><span className="text-gold-600">✓</span> Factory-direct pricing</li>
                  <li className="flex gap-1.5"><span className="text-gold-600">✓</span> OEM &amp; private label OK</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="px-4 pt-3 pb-4 bg-white border-t border-sand-200">
            <label className="block text-[10px] font-bold tracking-wider uppercase text-ink-500 mb-1.5 px-1">
              Your inquiry
            </label>
            <div className="relative mb-3">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={3}
                className="textarea text-xs !rounded-2xl !resize-none"
                placeholder="e.g. I need 500 pcs of YCS-BTY-001 lipstick, please quote FOB Ningbo..."
              />
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-cta btn-xl w-full !py-3.5 gap-2 text-sm font-extrabold shadow-gold-glow"
              style={{ background: 'linear-gradient(180deg,#25D366,#128C7E)', borderColor: '#128C7E' }}
            >
              <WhatsAppIcon className="w-5 h-5" />
              Send Inquiry via WhatsApp
            </a>
            <p className="text-[10px] text-center text-ink-400 mt-2.5">
              Or call <strong className="text-navy-700">{WHATSAPP_DISPLAY}</strong> · 24/7
            </p>
          </div>
        </div>
      )}

      {/* ---------- Floating FAB ---------- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat on WhatsApp"
        className={`fixed bottom-6 right-4 sm:right-7 z-50 group transition-all duration-300 ${
          isOpen ? 'scale-90 opacity-60' : ''
        }`}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-[#25D366]/20" />

        <div
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full
                      flex items-center justify-center text-white shadow-[0_14px_36px_rgba(37,211,102,0.55)]
                      transition-all group-hover:scale-110 group-active:scale-95`}
          style={{ background: 'radial-gradient(circle at 30% 30%, #50E894 0%, #25D366 50%, #128C7E 100%)' }}
        >
          <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" />

          {/* unread mini badge */}
          {showBubble && !isOpen && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-coral-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-coral-glow tabular">
              1
            </span>
          )}
        </div>
      </button>
    </>
  );
};

export default WhatsAppFloat;
