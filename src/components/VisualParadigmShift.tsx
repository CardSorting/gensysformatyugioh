'use client';

import React, { useState } from 'react';
import { getProxiedImageUrl } from '@/lib/images';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

interface ParadigmCard {
  cardId: number;
  cardName: string;
  points: number;
  advancedStatus: string;
  advancedStatusColor: string;
  genesysStatus: string;
  genesysStatusColor: string;
  takeaway: string;
}

const COMPARISONS: ParadigmCard[] = [
  {
    cardId: 55144522, // Pot of Greed
    cardName: 'Pot of Greed',
    points: 20,
    advancedStatus: 'FORBIDDEN 🚫',
    advancedStatusColor: '#ef4444',
    genesysStatus: 'LEGAL • 20 PTS ⚡',
    genesysStatusColor: 'var(--color-cyan)',
    takeaway: 'Iconic banned cards are legal for an appropriate point price.',
  },
  {
    cardId: 21044178, // Abyss Dweller
    cardName: 'Abyss Dweller',
    points: 100,
    advancedStatus: 'UNRESTRICTED',
    advancedStatusColor: 'var(--text-dim)',
    genesysStatus: '100 PTS • ALL-IN 🛑',
    genesysStatusColor: '#ef4444',
    takeaway: 'Heavy floodgates consume your entire 100-pt budget.',
  },
  {
    cardId: 14558127, // Ash Blossom
    cardName: 'Ash Blossom',
    points: 18,
    advancedStatus: '3X FREE IN ALL DECKS',
    advancedStatusColor: 'var(--text-dim)',
    genesysStatus: '18 PTS / COPY 💎',
    genesysStatusColor: '#38bdf8',
    takeaway: 'Staples are taxed so decks cannot pack every negate.',
  },
  {
    cardId: 89631139, // Blue-Eyes White Dragon
    cardName: 'Blue-Eyes Dragon',
    points: 0,
    advancedStatus: 'LEGAL',
    advancedStatusColor: 'var(--text-dim)',
    genesysStatus: '0 PTS • 100% FREE ✨',
    genesysStatusColor: '#10b981',
    takeaway: 'Over 10,000+ unlisted cards cost 0 points. Archetypes build free.',
  },
];

export function VisualParadigmShift() {
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const [inspectIndex, setInspectIndex] = useState<number>(-1);

  const handleInspect = (cardId: number, cardName: string, points: number, index: number) => {
    const known = getKnownCard(cardId, cardName);
    const resolved: Card = known || {
      id: cardId,
      name: cardName,
      type: 'Effect Monster',
      frameType: 'normal',
      desc: '',
      race: '',
      archetype: null,
      attribute: null,
      atk: null,
      def: null,
      level: null,
      scale: null,
      linkval: null,
      points: points,
      ban_tcg: null,
      images: [
        {
          id: cardId,
          image_url: `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`,
          image_url_small: `https://images.ygoprodeck.com/images/cards_small/${cardId}.jpg`,
          image_url_cropped: `https://images.ygoprodeck.com/images/cards_cropped/${cardId}.jpg`,
        },
      ],
    };
    setInspectCard(resolved);
    setInspectIndex(index);
  };

  return (
    <div>
      {/* 4 Cards Grid - Direct and Flush */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {COMPARISONS.map((item, idx) => {
          const thumbUrl = getProxiedImageUrl(item.cardId, 'cropped');
          return (
            <div
              key={item.cardName}
              onClick={() => handleInspect(item.cardId, item.cardName, item.points, idx)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-bright)',
                borderRadius: 12,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="hover-card"
              title={`Click to inspect ${item.cardName} — View official text & effect`}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--color-cyan)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 240, 255, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-bright)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                {/* Artwork & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 50,
                      height: 72,
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: '#040608',
                      border: `1.5px solid ${item.genesysStatusColor}`,
                      flexShrink: 0,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    }}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={item.cardName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🃏
                      </div>
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.cardName}
                    </div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--color-cyan)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>🔍 Click to inspect →</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges Comparison */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {/* Advanced Format */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.675rem',
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Advanced Format:</span>
                    <span style={{ color: item.advancedStatusColor, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {item.advancedStatus}
                    </span>
                  </div>

                  {/* Genesys Format */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.725rem',
                      padding: '5px 8px',
                      borderRadius: 6,
                      background: 'rgba(2, 132, 199, 0.15)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                    }}
                  >
                    <span style={{ color: '#fff', fontWeight: 700 }}>⚡ Genesys:</span>
                    <span style={{ color: item.genesysStatusColor, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                      {item.genesysStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Punchy 1-Sentence Takeaway */}
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 8,
                  lineHeight: 1.35,
                }}
              >
                {item.takeaway}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Detail Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => {
            setInspectCard(null);
            setInspectIndex(-1);
          }}
          onNext={
            inspectIndex < COMPARISONS.length - 1
              ? () => {
                  const next = COMPARISONS[inspectIndex + 1];
                  handleInspect(next.cardId, next.cardName, next.points, inspectIndex + 1);
                }
              : undefined
          }
          onPrev={
            inspectIndex > 0
              ? () => {
                  const prev = COMPARISONS[inspectIndex - 1];
                  handleInspect(prev.cardId, prev.cardName, prev.points, inspectIndex - 1);
                }
              : undefined
          }
          currentIndex={inspectIndex >= 0 ? inspectIndex : undefined}
          totalCards={COMPARISONS.length}
          deckSection="Paradigm Shift Showcase"
        />
      )}
    </div>
  );
}
