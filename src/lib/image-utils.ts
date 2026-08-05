export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return '/images/product-placeholder.svg';
  if (url.startsWith('/images/') || url.startsWith('data:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url;
}
