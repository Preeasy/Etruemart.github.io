import React from 'react';

interface AplusBlock {
  type: string;
  heading?: string;
  text?: string;
  image?: string;
}

interface AplusRendererProps {
  blocks: AplusBlock[];
}

// Clean HTML: remove &nbsp;, normalize divs, strip inline styles for consistency.
// Also strips any <img> tags — A+ content renders text only, no images.
function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/style="[^"]*"/g, '')
    // Remove <img> tags entirely (A+ renders text only)
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<div><br><\/div>/g, '<br/>')
    .replace(/<div>/g, '<p>')
    .replace(/<\/div>/g, '</p>')
    .replace(/<p><\/p>/g, '')
    .trim();
}

export default function AplusRenderer({ blocks }: AplusRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  // Filter to blocks that have heading or text content (image-only blocks are skipped)
  const textBlocks = blocks.filter((b) => {
    const heading = (b.heading || '').trim();
    const text = (b.text || '').trim();
    return heading.length > 0 || text.length > 0;
  });

  if (textBlocks.length === 0) return null;

  return (
    <div className="space-y-8 my-10">
      {textBlocks.map((block, i) => {
        const heading = (block.heading || '').trim();
        const text = cleanHtml(block.text || '');

        // ===== HERO: large heading + text (no image) =====
        if (block.type === 'hero') {
          return (
            <section
              key={i}
              className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-ink-900 to-ink-700 p-8 md:p-12 text-white"
            >
              {heading && (
                <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                  {heading}
                </h2>
              )}
              {text && (
                <div
                  className="text-base md:text-lg text-white/90 leading-relaxed prose prose-sm prose-invert max-w-none [&_p]:mb-3 [&_strong]:text-white [&_a]:text-accent-300 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              )}
            </section>
          );
        }

        // ===== TEXT IMAGE / IMAGE TEXT: render text-only (image ignored) =====
        if (block.type === 'textImage' || block.type === 'imageText') {
          return (
            <section
              key={i}
              className="bg-white rounded-xl p-6 md:p-8 border border-ink-100 shadow-sm"
            >
              {heading && (
                <h3 className="text-lg md:text-2xl font-bold text-navy-900 mb-4 pb-2 border-b-2 border-accent-500 inline-block">
                  {heading}
                </h3>
              )}
              {text && (
                <div
                  className="text-sm md:text-base text-ink-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-3 [&_strong]:text-navy-800 [&_a]:text-accent-600 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy-800 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              )}
            </section>
          );
        }

        // ===== TEXT (default): full-width text block =====
        return (
          <section
            key={i}
            className="bg-ink-50 rounded-xl p-6 md:p-8 border border-ink-100"
          >
            {heading && (
              <h3 className="text-lg md:text-2xl font-bold text-navy-900 mb-4">
                {heading}
              </h3>
            )}
            {text && (
              <div
                className="text-sm md:text-base text-ink-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-3 [&_strong]:text-navy-800 [&_a]:text-accent-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
