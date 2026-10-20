'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { getProxiedImageUrl } from '@/lib/images';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

interface SampleCard {
  id: number;
  name: string;
  points: number;
  type: 'Monster' | 'Spell' | 'Trap';
  role: string;
  isUnlisted?: boolean;
}

interface StagedCard {
  card: SampleCard;
  count: number;
}

const SAMPLE_CARDS: SampleCard[] = [
  { id: 21044178, name: 'Abyss Dweller', points: 100, type: 'Monster', role: 'Format-Defining Floodgate' },
  { id: 43898403, name: 'Agido the Ancient Sentinel', points: 33, type: 'Monster', role: 'Graveyard Mill Engine' },
  { id: 34004470, name: 'Albion the Sanctifire Dragon', points: 33, type: 'Monster', role: 'Branded Lock Piece' },
  { id: 89488382, name: 'A Hero Lives', points: 30, type: 'Spell', role: 'HERO Consistency Starter' },
  { id: 6368038, name: 'Triple Tactics Talent', points: 20, type: 'Spell', role: 'Hand Disruption & Draw' },
  { id: 94689635, name: 'Adamancipator Risen - Dragite', points: 15, type: 'Monster', role: 'Spell/Trap Omni-Negate' },
  { id: 14558127, name: 'Ash Blossom & Joyous Spring', points: 15, type: 'Monster', role: 'Universal Hand Trap' },
  { id: 87746184, name: 'Albion the Branded Dragon', points: 5, type: 'Monster', role: 'Branded Fusion Bridge' },
  { id: 86120751, name: 'Aleister the Reminiscent', points: 4, type: 'Monster', role: 'Invoked Normal Summon' },
  { id: 89631139, name: 'Blue-Eyes White Dragon', points: 0, type: 'Monster', role: 'Classic Dragon Boss', isUnlisted: true },
  { id: 46986414, name: 'Dark Magician', points: 0, type: 'Monster', role: 'Classic Spellcaster Engine', isUnlisted: true },
  { id: 72302403, name: 'Archetype In-Engine Pieces', points: 0, type: 'Spell', role: 'Over 10,000+ Unlisted Cards', isUnlisted: true },
];

interface Preset {
  name: string;
  badge: string;
  description: string;
  items: Array<{ name: string; count: number }>;
}

const PRESETS: Preset[] = [
  {
    name: 'The Solo Titan (100 Pts)',
    badge: '100 PTS',
    description: 'Invest your entire budget into a single format-warping boss monster (1x Abyss Dweller). All other cards in Main, Extra, and Side must cost 0 points.',
    items: [
      { name: 'Abyss Dweller', count: 1 },
      { name: 'Blue-Eyes White Dragon', count: 3 },
      { name: 'Archetype In-Engine Pieces', count: 3 },
    ],
  },
  {
    name: 'Triple Hero Lives (90 Pts)',
    badge: '90 PTS',
    description: 'Demonstrates running 3 copies of a 30-pt card (3 × 30 = 90 pts), leaving 10 points for utility staples.',
    items: [
      { name: 'A Hero Lives', count: 3 },
      { name: 'Albion the Branded Dragon', count: 2 },
    ],
  },
  {
    name: 'Balanced Midrange (69 Pts)',
    badge: '69 PTS',
    description: 'A versatile competitive mix: 2x Ash Blossom (30 pts), 1x Triple Tactics (20 pts), 1x Dragite (15 pts), and 1x Aleister (4 pts).',
    items: [
      { name: 'Ash Blossom & Joyous Spring', count: 2 },
      { name: 'Triple Tactics Talent', count: 1 },
      { name: 'Adamancipator Risen - Dragite', count: 1 },
      { name: 'Aleister the Reminiscent', count: 1 },
      { name: 'Archetype In-Engine Pieces', count: 3 },
    ],
  },
  {
    name: 'Pure 0-Pt Archetype (0 Pts)',
    badge: '0 PTS',
    description: 'An unlisted engine deck that leaves all 100 points untouched for high-impact Side Deck silver bullets.',
    items: [
      { name: 'Blue-Eyes White Dragon', count: 3 },
      { name: 'Dark Magician', count: 3 },
      { name: 'Archetype In-Engine Pieces', count: 3 },
    ],
  },
];

export function BudgetSandbox() {
  const [stagedCards, setStagedCards] = useState<StagedCard[]>([
    { card: SAMPLE_CARDS[3], count: 1 }, // A Hero Lives (30)
    { card: SAMPLE_CARDS[4], count: 1 }, // Triple Tactics Talent (20)
    { card: SAMPLE_CARDS[6], count: 1 }, // Ash Blossom (15)
    { card: SAMPLE_CARDS[9], count: 3 }, // Blue-Eyes (0)
  ]);

  const [copiedToast, setCopiedToast] = useState(false);
  const [inspectCard, setInspectCard] = useState<Card | null>(null);

  const handleInspectCard = (card: SampleCard) => {
    const known = getKnownCard(card.id, card.name);
    const resolved: Card = known || {
      id: card.id,
      name: card.name,
      type: card.type === 'Monster' ? 'Effect Monster' : card.type,
      frameType: card.type === 'Monster' ? 'effect' : card.type.toLowerCase(),
      desc: card.role,
      race: '',
      archetype: null,
      attribute: null,
      atk: null,
      def: null,
      level: null,
      scale: null,
      linkval: null,
      points: card.points,
      ban_tcg: null,
      images: [
        {
          id: card.id,
          image_url: `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
          image_url_small: `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`,
          image_url_cropped: `https://images.ygoprodeck.com/images/cards_cropped/${card.id}.jpg`,
        },
      ],
    };
    setInspectCard(resolved);
  };

  const totalPoints = useMemo(() => {
    return stagedCards.reduce((acc, item) => acc + item.card.points * item.count, 0);
  }, [stagedCards]);

  const isOverBudget = totalPoints > 100;
  const isBudgetFull = totalPoints === 100;
  const remainingPoints = 100 - totalPoints;

  const addOrIncrementCard = (card: SampleCard) => {
    setStagedCards(prev => {
      const existing = prev.find(item => item.card.name === card.name);
      if (existing) {
        if (existing.count >= 3) {
          // Wrap around to remove if at max
          return prev.filter(item => item.card.name !== card.name);
        }
        return prev.map(item =>
          item.card.name === card.name ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...prev, { card, count: 1 }];
    });
  };

  const decrementCard = (cardName: string) => {
    setStagedCards(prev => {
      const existing = prev.find(item => item.card.name === cardName);
      if (!existing) return prev;
      if (existing.count <= 1) {
        return prev.filter(item => item.card.name !== cardName);
      }
      return prev.map(item =>
        item.card.name === cardName ? { ...item, count: item.count - 1 } : item
      );
    });
  };

  const removeCard = (cardName: string) => {
    setStagedCards(prev => prev.filter(item => item.card.name !== cardName));
  };

  const applyPreset = (preset: Preset) => {
    const newStaged: StagedCard[] = [];
    for (const item of preset.items) {
      const card = SAMPLE_CARDS.find(c => c.name === item.name);
      if (card) {
        newStaged.push({ card, count: item.count });
      }
    }
    setStagedCards(newStaged);
  };

  const clearSelection = () => {
    setStagedCards([]);
  };

  const copyLoadout = () => {
    const lines = stagedCards.map(
      item => `${item.count}x ${item.card.name} (${item.card.points * item.count} pts [${item.card.points} each])`
    );
    const summary = [
      `=== GENESYS 100-POINT BUDGET LOADOUT ===`,
      ...lines,
      `----------------------------------------`,
      `Total Points: ${totalPoints} / 100 PTS (${isOverBudget ? 'ILLEGAL: OVER BUDGET' : 'LEGAL'})`,
      `Remaining: ${Math.max(0, 100 - totalPoints)} PTS`,
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
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
      {/* Title & Explainer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 10,
                background: 'rgba(2, 132, 199, 0.25)',
                color: 'var(--color-cyan)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                fontWeight: 700,
              }}
            >
              HANDS-ON SIMULATOR
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Supports Card Copies (Up to 3x per Rule 2)
            </span>
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              color: '#fff',
              margin: '0 0 6px 0',
              fontWeight: 800,
            }}
          >
            The 100-Point Budget Sandbox
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
            In Genesys, your entire deck (Main Deck + Extra Deck + Side Deck combined) shares a strict 100-point budget.
            Click cards below to stage 1x, 2x, or 3x copies and watch the point meter respond in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={copyLoadout}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '5px 12px' }}
            title="Copy current budget allocation summary to clipboard"
          >
            {copiedToast ? '✓ Copied!' : '📋 Copy Loadout'}
          </button>
          <button
            onClick={clearSelection}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '5px 12px' }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Preset Strategy Loadouts */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
          Load Verified Tournament Strategies:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-cyan)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              title={preset.description}
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Budget Gauge */}
      <div
        style={{
          background: 'var(--bg-primary)',
          border: `1px solid ${isOverBudget ? 'rgba(239, 68, 68, 0.6)' : isBudgetFull ? 'rgba(245, 158, 11, 0.6)' : 'var(--border-bright)'}`,
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 20,
          transition: 'border-color 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.5rem',
                fontWeight: 900,
                color: isOverBudget ? '#ef4444' : isBudgetFull ? 'var(--color-gold-light)' : 'var(--color-cyan)',
              }}
            >
              {totalPoints} / 100 PTS
            </span>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
              ({stagedCards.reduce((a, b) => a + b.count, 0)} cards staged across Main/Extra/Side)
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 8,
              background: isOverBudget
                ? 'rgba(239, 68, 68, 0.15)'
                : isBudgetFull
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(16, 185, 129, 0.15)',
              color: isOverBudget ? '#fca5a5' : isBudgetFull ? 'var(--color-gold-light)' : '#34d399',
              border: `1px solid ${isOverBudget ? '#ef4444' : isBudgetFull ? '#f59e0b' : '#10b981'}`,
            }}
          >
            {isOverBudget
              ? `⚠️ OVER BUDGET BY +${totalPoints - 100} PTS`
              : isBudgetFull
              ? '🎯 EXACT 100/100 BUDGET'
              : `✅ ${remainingPoints} PTS REMAINING`}
          </div>
        </div>

        {/* Progress Bar Meter with Milestone Ticks */}
        <div style={{ position: 'relative', height: 12, width: '100%', marginBottom: 6 }}>
          <div
            style={{
              height: '100%',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 6,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, totalPoints)}%`,
                background: isOverBudget
                  ? 'linear-gradient(90deg, #ef4444, #b91c1c)'
                  : isBudgetFull
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #0284c7, #00f0ff)',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
                boxShadow: isOverBudget
                  ? '0 0 12px rgba(239, 68, 68, 0.6)'
                  : '0 0 12px rgba(0, 240, 255, 0.4)',
              }}
            />
          </div>

          {/* Tick markers for 25, 50, 75, 100 */}
          {[25, 50, 75, 100].map(pt => (
            <div
              key={pt}
              style={{
                position: 'absolute',
                left: `${pt}%`,
                top: 0,
                bottom: 0,
                width: 1,
                background: 'rgba(255, 255, 255, 0.3)',
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>

        {/* Milestone Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          <span>0 PTS</span>
          <span>25 PTS</span>
          <span>50 PTS</span>
          <span>75 PTS</span>
          <span>100 PTS (MAX)</span>
        </div>

        {/* Contextual Status Tip */}
        <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          {isOverBudget ? (
            <span style={{ color: '#fca5a5' }}>
              <strong>Deck is illegal for official Genesys tournaments.</strong> Reduce card counts or replace with 0-point unlisted cards to comply with the 100-point cap.
            </span>
          ) : isBudgetFull ? (
            <span style={{ color: 'var(--color-gold-light)' }}>
              <strong>100% budget utilized!</strong> All remaining cards in your 40–60 Main Deck, 0–15 Extra Deck, and 0–15 Side Deck must cost 0 points.
            </span>
          ) : (
            <span>
              You have <strong style={{ color: '#fff' }}>{remainingPoints} points</strong> left. You can use these for Side Deck counters, Extra Deck bosses, or leave them unspent without penalty.
            </span>
          )}
        </div>
      </div>

      {/* Staged Cards Tray (Active Deck Summary) */}
      {stagedCards.length > 0 && (
        <div
          style={{
            background: 'rgba(2, 132, 199, 0.05)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Staged Cards in Simulator ({stagedCards.length}):</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>Rule: Up to 3x per card</span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stagedCards.map(item => (
              <div
                key={item.card.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ fontWeight: 800, color: '#fff' }}>{item.count}×</span>
                <span style={{ color: 'var(--text-primary)' }}>{item.card.name}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: item.card.points === 0 ? '#34d399' : 'var(--color-gold-light)',
                    fontWeight: 700,
                  }}
                >
                  {item.card.points * item.count} pts
                </span>

                {/* Adjuster controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 4 }}>
                  <button
                    onClick={() => decrementCard(item.card.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0 3px',
                    }}
                    title="Decrease count"
                  >
                    -
                  </button>
                  <button
                    onClick={() => addOrIncrementCard(item.card)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-cyan)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0 3px',
                    }}
                    title="Increase count (up to 3x)"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeCard(item.card.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0 3px',
                      marginLeft: 2,
                    }}
                    title="Remove from simulator"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Selection Grid with Proxied Artwork */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
            Click Card to Stage (Click again to add 2x or 3x):
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Green = 0 pts &bull; Blue = Minor &bull; Gold = Heavy &bull; Red = 100 pts
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 10,
          }}
        >
          {SAMPLE_CARDS.map(card => {
            const staged = stagedCards.find(item => item.card.name === card.name);
            const isSelected = !!staged;
            const count = staged?.count || 0;
            const thumbUrl = getProxiedImageUrl(card.id, 'cropped');

            return (
              <div
                key={card.name}
                onClick={() => addOrIncrementCard(card)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: isSelected ? 'var(--bg-surface-raised)' : 'var(--bg-primary)',
                  border: isSelected
                    ? '1.5px solid var(--color-cyan)'
                    : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                  gap: 10,
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }
                }}
              >
                {/* Thumbnail Art */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: '#040608',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={card.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <span style={{ fontSize: '0.9rem' }}>🃏</span>
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {card.name}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', lineHeight: 1.2 }}>
                    {card.role}
                  </div>
                </div>

                {/* Point Pill & Quantity Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {isSelected && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.725rem',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'var(--color-cyan)',
                        color: '#07090e',
                      }}
                      title={`${count} copies staged`}
                    >
                      {count}x
                    </span>
                  )}

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 6,
                      background:
                        card.points === 0
                          ? 'rgba(16, 185, 129, 0.2)'
                          : card.points >= 50
                          ? 'rgba(239, 68, 68, 0.2)'
                          : card.points >= 20
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(2, 132, 199, 0.2)',
                      color:
                        card.points === 0
                          ? '#34d399'
                          : card.points >= 50
                          ? '#fca5a5'
                          : card.points >= 20
                          ? 'var(--color-gold-light)'
                          : 'var(--color-cyan)',
                      border: `1px solid ${
                        card.points === 0
                          ? 'rgba(16, 185, 129, 0.4)'
                          : card.points >= 50
                          ? 'rgba(239, 68, 68, 0.4)'
                          : card.points >= 20
                          ? 'rgba(245, 158, 11, 0.4)'
                          : 'rgba(2, 132, 199, 0.4)'
                      }`,
                    }}
                  >
                    {card.points} PTS
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspectCard(card);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      color: 'var(--color-cyan)',
                      cursor: 'pointer',
                      padding: '2px 5px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={`Inspect ${card.name} card effects & stats`}
                  >
                    🔍
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Link to Full Point Visualizer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.775rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          Official point values reflect the active Konami Genesys sheet. Over 750 cards currently carry point costs.
        </div>
        <Link
          href="/cards"
          style={{
            color: 'var(--color-cyan)',
            textDecoration: 'none',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Browse All 750+ Pointed Cards in Gallery</span>
          <span>→</span>
        </Link>
      </div>

      {/* Card Detail Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => setInspectCard(null)}
          deckSection="100-Point Sandbox"
        />
      )}
    </div>
  );
}
