import { Image as ImageIcon } from 'lucide-react';

interface AplusBlock {
  type: string;
  heading?: string;
  text?: string;
  image?: string;
}

interface AplusRendererProps {
  blocks: AplusBlock[];
}

// Clean HTML: remove &nbsp;, normalize divs, strip inline styles for consistency
function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/style="[^"]*"/g, '')
    .replace(/<div><br><\/div>/g, '<br/>')
    .replace(/<div>/g, '<p>')
    .replace(/<\/div>/g, '</p>')
    .replace(/<p><\/p>/g, '')
    .trim();
}

export default function AplusRenderer({ blocks }: AplusRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block, i) => {
        const heading = block.heading || '';
        const text = cleanHtml(block.text || '');
        const image = block.image || '';
        const hasImage = !!image;

        // ===== HERO: large image + overlaid heading =====
        if (block.type === 'hero') {
          return (
            <section key={i} className="relative rounded-2xl overflow-hidden shadow-lg">
              {hasImage ? (
                <div className="relative">
                  <img
                    src={image}
                    alt={heading}
                    className="w-full h-[300px] md:h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    {heading && (
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{heading}</h2>
                    )}
                    {text && (
                      <div
                        className="text-sm md:text-base text-white/90 leading-relaxed max-w-2xl prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_strong]:text-white [&_li]:text-white/90 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-navy-800 to-accent-800 p-8 rounded-2xl">
                  {heading && <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{heading}</h2>}
                  {text && (
                    <div
                      className="text-sm text-white/90 leading-relaxed prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_strong]:text-white"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  )}
                </div>
              )}
            </section>
          );
        }

        // ===== TEXT IMAGE: text left, image right =====
        if (block.type === 'textImage') {
          return (
            <section key={i} className="grid md:grid-cols-2 gap-6 items-center">
              <div className="order-2 md:order-1">
                {heading && (
                  <h3 className="text-lg md:text-xl font-bold text-navy-900 mb-3 pb-2 border-b-2 border-accent-500 inline-block">
                    {heading}
                  </h3>
                )}
                {text && (
                  <div
                    className="text-sm text-ink-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-3 [&_strong]:text-navy-800 [&_a]:text-accent-600 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy-800 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                )}
              </div>
              {hasImage ? (
                <div className="order-1 md:order-2">
                  <img
                    src={image}
                    alt={heading}
                    className="w-full rounded-xl shadow-md object-cover"
                  />
                </div>
              ) : (
                <div className="order-1 md:order-2 flex items-center justify-center h-48 bg-ink-50 rounded-xl">
                  <ImageIcon className="w-12 h-12 text-ink-300" />
                </div>
              )}
            </section>
          );
        }

        // ===== IMAGE TEXT: image left, text right =====
        if (block.type === 'imageText') {
          return (
            <section key={i} className="grid md:grid-cols-2 gap-6 items-center">
              {hasImage ? (
                <div>
                  <img
                    src={image}
                    alt={heading}
                    className="w-full rounded-xl shadow-md object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-ink-50 rounded-xl">
                  <ImageIcon className="w-12 h-12 text-ink-300" />
                </div>
              )}
              <div>
                {heading && (
                  <h3 className="text-lg md:text-xl font-bold text-navy-900 mb-3 pb-2 border-b-2 border-accent-500 inline-block">
                    {heading}
                  </h3>
                )}
                {text && (
                  <div
                    className="text-sm text-ink-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-3 [&_strong]:text-navy-800 [&_a]:text-accent-600 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy-800 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                )}
              </div>
            </section>
          );
        }

        // ===== TEXT: full-width text block =====
        return (
          <section key={i} className="bg-ink-50 rounded-xl p-6 border border-ink-100">
            {heading && (
              <h3 className="text-lg md:text-xl font-bold text-navy-900 mb-3">{heading}</h3>
            )}
            {text && (
              <div
                className="text-sm text-ink-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-3 [&_strong]:text-navy-800 [&_a]:text-accent-600 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
