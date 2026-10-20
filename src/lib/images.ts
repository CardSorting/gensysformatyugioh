/**
 * Image URL resolver utilizing local BroccoliDB Content-Addressed Storage cache.
 * Routes images through local /api/images/[type]/[id] proxy to prevent external
 * YGOPRODeck CDN spamming and guarantee zero broken images.
 */

export function getProxiedImageUrl(
  cardId: number | undefined,
  type: 'small' | 'cropped' | 'normal' = 'small',
  fallbackUrl?: string
): string {
  let effectiveId = cardId && cardId > 0 ? cardId : undefined;

  // If cardId is missing, attempt to extract numeric ID from fallbackUrl
  if (!effectiveId && fallbackUrl) {
    const match = fallbackUrl.match(/\/(\d+)\.(jpg|png|webp|svg)/i);
    if (match) {
      effectiveId = parseInt(match[1], 10);
    }
  }

  if (effectiveId && effectiveId > 0) {
    return `/api/images/${type}/${effectiveId}`;
  }

  return fallbackUrl || '';
}

export function getDeckThumbnailUrl(
  signatureCardId: number | undefined,
  fallbackUrl?: string
): string {
  return getProxiedImageUrl(signatureCardId, 'cropped', fallbackUrl);
}
