'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getProxiedImageUrl } from '@/lib/images';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

interface Shelf {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  oneLiner: string;
  queryParam: string;
  cards: Array<{
    id: number;
    name: string;
    points: number;
  }>;
}

const SHELVES: Shelf[] = [
  {
    id: '100-pts',
    name: '100-Point Titans',
    badge: '100 PTS • ENTIRE BUDGET',
    badgeColor: '#ef4444',
    oneLiner: 'One copy uses your entire 100-pt budget. Remaining 69+ cards must cost 0 pts.',
    queryParam: '100',
    cards: [
      { id: 21044178, name: 'Abyss Dweller', points: 100 },
      { id: 13332685, name: 'Ame no Habakiri', points: 100 },
      { id: 74131780, name: 'Painful Choice', points: 100 },
    ],
  },
  {
    id: '30-50-pts',
    name: '30–50 Point Heavyweights',
    badge: '30–50 PTS • MAJOR ENGINES',
    badgeColor: '#f59e0b',
    oneLiner: 'Game-altering engine starters. You can fit 2 to 3 across your entire 70-card list.',
    queryParam: '25-49',
    cards: [
      { id: 8949584, name: 'A Hero Lives', points: 30 },
      { id: 43898403, name: 'Agido the Sentinel', points: 33 },
      { id: 34004470, name: 'Albion Sanctifire', points: 33 },
      { id: 10443958, name: 'Cyber Dragon Infinity', points: 33 },
    ],
  },
  {
    id: '10-25-pts',
    name: '10–25 Point Staples',
    badge: '10–25 PTS • TACTICAL TECH',
    badgeColor: '#00f0ff',
    oneLiner: 'Universal hand traps and board breakers. Run 4 to 6 staples to round out your deck.',
    queryParam: '10-24',
    cards: [
      { id: 55144522, name: 'Pot of Greed', points: 20 },
      { id: 14558127, name: 'Ash Blossom', points: 18 },
      { id: 6368038, name: 'Triple Tactics Talent', points: 20 },
      { id: 12580477, name: 'Raigeki', points: 2 },
    ],
  },
  {
    id: '0-pts',
    name: '0-Point Free Pool',
    badge: '0 PTS • 10,000+ FREE CARDS',
    badgeColor: '#10b981',
    oneLiner: 'All unlisted cards cost 0 pts. Build your archetype core with zero budget penalty.',
    queryParam: '0',
    cards: [
      { id: 89631139, name: 'Blue-Eyes Dragon', points: 0 },
      { id: 44095762, name: 'Mirror Force', points: 0 },
      { id: 70095154, name: 'Cyber Dragon', points: 0 },
      { id: 74509280, name: 'Tenpai Dragon', points: 0 },
    ],
  },
];

export function VisualPointShelves() {
  const [selectedShelfId, setSelectedShelfId] = useState<string>('100-pts');
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const [inspectIndex, setInspectIndex] = useState<number>(-1);
  const activeShelf = SHELVES.find(s => s.id === selectedShelfId) || SHELVES[0];

  const handleInspectCard = (cardId: number, cardName: string, points: number, index: number) => {
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
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 16,
        padding: '24px 20px',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-gold-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
            <span>🏷️</span>
            <span>Visual Card Shelves</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 800 }}>
            Card Price Tags in Action
          </h3>
        </div>

        <Link
          href={`/cards?points=${activeShelf.queryParam}`}
          style={{
            fontSize: '0.775rem',
            color: 'var(--color-cyan)',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Browse {activeShelf.name} in Gallery</span>
          <span>→</span>
        </Link>
      </div>

      {/* Shelf Filter Buttons */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 18,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {SHELVES.map(s => {
          const isSelected = s.id === selectedShelfId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedShelfId(s.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                background: isSelected ? 'var(--bg-surface-raised)' : 'var(--bg-primary)',
                border: isSelected ? `1.5px solid ${s.badgeColor}` : '1px solid var(--border-subtle)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.badgeColor }} />
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Shelf Headline */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.725rem',
            fontWeight: 900,
            padding: '3px 8px',
            borderRadius: 6,
            background: `${activeShelf.badgeColor}22`,
            color: activeShelf.badgeColor,
            border: `1px solid ${activeShelf.badgeColor}66`,
          }}
        >
          {activeShelf.badge}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>
          {activeShelf.oneLiner}
        </span>
      </div>

      {/* Cards Shelf Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {activeShelf.cards.map((c, idx) => {
          const thumbUrl = getProxiedImageUrl(c.id, 'cropped');
          return (
            <div
              key={c.id}
              onClick={() => handleInspectCard(c.id, c.name, c.points, idx)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 12,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              className="hover-card"
              title={`Click to inspect ${c.name} (${c.points} pts) — View card effect & stats`}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = activeShelf.badgeColor;
                e.currentTarget.style.boxShadow = `0 6px 16px ${activeShelf.badgeColor}33`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card Image */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '421 / 614',
                  maxHeight: 180,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#040608',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                  position: 'relative',
                }}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={c.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🃏
                  </div>
                )}

                {/* Point Tag floating over card */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.725rem',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'rgba(7, 9, 14, 0.9)',
                    color: activeShelf.badgeColor,
                    border: `1.5px solid ${activeShelf.badgeColor}`,
                    boxShadow: `0 0 10px ${activeShelf.badgeColor}44`,
                  }}
                >
                  {c.points} PTS
                </div>
              </div>

              {/* Card Title */}
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 800,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
                title={c.name}
              >
                {c.name}
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--color-cyan)', marginTop: 4 }}>
                🔍 View Effect →
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Inspector Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => {
            setInspectCard(null);
            setInspectIndex(-1);
          }}
          onNext={
            inspectIndex < activeShelf.cards.length - 1
              ? () => {
                  const nextCard = activeShelf.cards[inspectIndex + 1];
                  handleInspectCard(nextCard.id, nextCard.name, nextCard.points, inspectIndex + 1);
                }
              : undefined
          }
          onPrev={
            inspectIndex > 0
              ? () => {
                  const prevCard = activeShelf.cards[inspectIndex - 1];
                  handleInspectCard(prevCard.id, prevCard.name, prevCard.points, inspectIndex - 1);
                }
              : undefined
          }
          currentIndex={inspectIndex >= 0 ? inspectIndex : undefined}
          totalCards={activeShelf.cards.length}
          deckSection={activeShelf.name}
        />
      )}
    </div>
  );
}
