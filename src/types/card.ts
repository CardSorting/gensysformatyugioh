export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export type CardTypeCategory = 
  | 'Normal Monster'
  | 'Effect Monster'
  | 'Ritual Monster'
  | 'Fusion Monster'
  | 'Synchro Monster'
  | 'XYZ Monster'
  | 'Spell Card'
  | 'Trap Card'
  | 'Link Monster'
  | 'Pendulum Monster'
  | 'Other';

export interface Card {
  id: number;
  name: string;
  type: string;
  frameType: string;
  humanReadableCardType?: string;
  desc: string;
  race: string;
  archetype?: string | null;
  attribute?: string | null;
  atk?: number | null;
  def?: number | null;
  level?: number | null;
  scale?: number | null;
  linkval?: number | null;
  points: number; // Genesys official points (0 = free)
  ban_tcg?: string | null; // Advanced format banlist status: "Forbidden" | "Limited" | "Semi-Limited" | null
  images: CardImage[];
  selectedImageId?: number;
}

export function isLinkMonster(card: Pick<Card, 'type' | 'frameType' | 'linkval'>): boolean {
  return (
    Boolean(card.type && card.type.toLowerCase().includes('link')) ||
    card.frameType === 'link' ||
    typeof card.linkval === 'number'
  );
}

export function isPendulumMonster(card: Pick<Card, 'type' | 'frameType' | 'scale'>): boolean {
  return (
    Boolean(card.type && card.type.toLowerCase().includes('pendulum')) ||
    typeof card.scale === 'number'
  );
}

export function isExtraDeckCard(card: Pick<Card, 'type' | 'frameType'>): boolean {
  const t = card.type.toLowerCase();
  return (
    t.includes('fusion') ||
    t.includes('synchro') ||
    t.includes('xyz') ||
    card.frameType === 'fusion' ||
    card.frameType === 'synchro' ||
    card.frameType === 'xyz'
  );
}
