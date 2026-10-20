'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getProxiedImageUrl } from '@/lib/images';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

interface ShowcasePreset {
  id: string;
  name: string;
  subtitle: string;
  totalPoints: number;
  meterColor: string;
  badge: string;
  mainPts: number;
  extraPts: number;
  sidePts: number;
  takeaway: string;
  cards: Array<{
    id: number;
    name: string;
    points: number;
    badge: string;
    badgeColor: string;
    role: string;
  }>;
}

const SHOWCASE_PRESETS: ShowcasePreset[] = [
  {
    id: 'titan',
    name: 'The Solo Titan',
    subtitle: '100% Wallet Investment',
    totalPoints: 100,
    meterColor: '#ef4444',
    badge: '100 PTS • ALL-IN BOSS',
    mainPts: 0,
    extraPts: 100,
    sidePts: 0,
    takeaway: 'Consumes your entire 100-pt wallet in the Extra Deck. Remaining 69+ cards must cost 0 pts.',
    cards: [
      { id: 21044178, name: 'Abyss Dweller', points: 100, badge: '100 PTS', badgeColor: '#ef4444', role: 'All-In Floodgate' },
      { id: 89631139, name: 'Blue-Eyes Dragon', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: '100% Free Core' },
      { id: 70095154, name: 'Cyber Dragon', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: '100% Free Core' },
    ],
  },
  {
    id: 'midrange',
    name: 'Tactical Midrange',
    subtitle: 'Balanced Power & Staples',
    totalPoints: 88,
    meterColor: 'var(--color-cyan)',
    badge: '88 PTS • 12 PTS BUFFER',
    mainPts: 68,
    extraPts: 10,
    sidePts: 10,
    takeaway: 'Distributes points across iconic draw spells, hand traps, and starter spells across all three deck zones.',
    cards: [
      { id: 55144522, name: 'Pot of Greed', points: 20, badge: '20 PTS', badgeColor: 'var(--color-cyan)', role: 'Iconic Draw' },
      { id: 14558127, name: 'Ash Blossom', points: 18, badge: '18 PTS', badgeColor: 'var(--color-cyan)', role: 'Hand Trap' },
      { id: 8949584, name: 'A Hero Lives', points: 30, badge: '30 PTS', badgeColor: '#f59e0b', role: 'Engine Starter' },
      { id: 6368038, name: 'Triple Tactics Talent', points: 20, badge: '20 PTS', badgeColor: 'var(--color-cyan)', role: 'Turnaround Spell' },
    ],
  },
  {
    id: 'champion',
    name: 'Championship YCS List',
    subtitle: 'Enzo Fiallos (#1 Rank)',
    totalPoints: 100,
    meterColor: '#f59e0b',
    badge: '100 PTS • YCS HOUSTON #1',
    mainPts: 70,
    extraPts: 20,
    sidePts: 10,
    takeaway: 'Leveraged 0-pt Thunder extenders while investing 70 pts into devastating Main Deck board disruption.',
    cards: [
      { id: 58916810, name: 'Crackle Blitzclique', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'Free Engine Core' },
      { id: 14558127, name: 'Ash Blossom', points: 18, badge: '18 PTS', badgeColor: 'var(--color-cyan)', role: 'Taxed Staple' },
      { id: 6368038, name: 'Triple Tactics Talent', points: 20, badge: '20 PTS', badgeColor: 'var(--color-cyan)', role: 'Hand Disruption' },
      { id: 42410161, name: 'Angelechy Shatranga', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'Free Extra Boss' },
    ],
  },
];

export function HeroVisualFormula() {
  const [activePresetId, setActivePresetId] = useState<string>('midrange');
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const [inspectIndex, setInspectIndex] = useState<number>(-1);
  const activePreset = SHOWCASE_PRESETS.find(p => p.id === activePresetId) || SHOWCASE_PRESETS[1];

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
    <div style={{ marginTop: 24, marginBottom: 8 }}>
      {/* Interactive Showcase Box */}
      <div
        style={{
          background: 'rgba(10, 15, 25, 0.95)',
          border: '1px solid var(--border-medium)',
          borderRadius: 16,
          padding: '20px 18px',
          boxShadow: 'var(--shadow-lg), 0 0 24px rgba(0, 240, 255, 0.1)',
        }}
      >
        {/* Showcase Header: Preset Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
              <span>🎛️</span>
              <span>Interactive Format Deck Rig &bull; Live Point Budgeting</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              How 100 Points Work in Real Decks
            </div>
          </div>

          {/* 3 Preset Switcher Tabs */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: 4,
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              gap: 4,
            }}
          >
            {SHOWCASE_PRESETS.map(p => {
              const isSelected = p.id === activePresetId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePresetId(p.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 7,
                    background: isSelected ? 'var(--bg-surface-raised)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    border: isSelected ? `1px solid ${p.meterColor}` : '1px solid transparent',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{p.name}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      color: isSelected ? p.meterColor : 'var(--text-dim)',
                    }}
                  >
                    ({p.totalPoints}p)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Animated 100-Pt Budget Meter */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-bright)',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: `${activePreset.meterColor}22`,
                  color: activePreset.meterColor,
                  border: `1px solid ${activePreset.meterColor}55`,
                }}
              >
                {activePreset.badge}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>
                {activePreset.takeaway}
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', fontWeight: 900 }}>
              <span style={{ color: activePreset.meterColor }}>{activePreset.totalPoints}</span>
              <span style={{ color: 'var(--text-dim)' }}> / 100 PTS</span>
            </div>
          </div>

          {/* Segmented Budget Progress Bar */}
          <div style={{ height: 10, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 5, overflow: 'hidden', display: 'flex', marginBottom: 8 }}>
            <div
              style={{
                width: `${activePreset.mainPts}%`,
                background: 'var(--color-cyan)',
                transition: 'width 0.3s ease',
              }}
              title={`Main Deck: ${activePreset.mainPts} pts`}
            />
            <div
              style={{
                width: `${activePreset.extraPts}%`,
                background: '#c084fc',
                transition: 'width 0.3s ease',
              }}
              title={`Extra Deck: ${activePreset.extraPts} pts`}
            />
            <div
              style={{
                width: `${activePreset.sidePts}%`,
                background: '#f59e0b',
                transition: 'width 0.3s ease',
              }}
              title={`Side Deck: ${activePreset.sidePts} pts`}
            />
          </div>

          {/* Compartment Legend Ticker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ color: 'var(--color-cyan)' }}>■ Main: {activePreset.mainPts} pts</span>
              <span style={{ color: '#c084fc' }}>■ Extra: {activePreset.extraPts} pts</span>
              <span style={{ color: '#f59e0b' }}>■ Side: {activePreset.sidePts} pts</span>
            </div>
            <span style={{ color: '#34d399', fontWeight: 700 }}>
              {100 - activePreset.totalPoints} PTS REMAINING BUFFER
            </span>
          </div>
        </div>

        {/* Real Visual Card Slabs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${activePreset.cards.length > 3 ? '220px' : '260px'}, 1fr))`,
            gap: 12,
            marginBottom: 16,
          }}
        >
          {activePreset.cards.map((c, idx) => {
            const thumbUrl = getProxiedImageUrl(c.id, 'cropped');
            return (
              <div
                key={c.name}
                onClick={() => handleInspectCard(c.id, c.name, c.points, idx)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                className="hover-card"
                title={`Click to inspect ${c.name} (${c.points} pts) — View card effect & stats`}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--color-cyan)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 240, 255, 0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Card Art Thumbnail */}
                <div
                  style={{
                    width: 52,
                    height: 74,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: '#040608',
                    border: `1.5px solid ${c.badgeColor}88`,
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
                  }}
                >
                  {thumbUrl ? (
                    <img src={thumbUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🃏</div>
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: `${c.badgeColor}22`,
                        color: c.badgeColor,
                        border: `1px solid ${c.badgeColor}55`,
                      }}
                    >
                      {c.badge}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {c.role}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>🔍 View Card Effect →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Deck Wallet Equation Bar */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: 10,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.1rem' }}>📐</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Deck Blueprint:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 700, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 7px', borderRadius: 5 }}>Main (40–60)</span>
              <span>+</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 7px', borderRadius: 5 }}>Extra (0–15)</span>
              <span>+</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 7px', borderRadius: 5 }}>Side (0–15)</span>
              <span style={{ color: 'var(--color-gold-light)', marginLeft: 4, fontWeight: 900 }}>= ≤ 100 PTS COMBINED</span>
            </div>
          </div>

          <Link
            href="/cards"
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-cyan)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Explore Point List (750 Cards) →</span>
          </Link>
        </div>
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
            inspectIndex < activePreset.cards.length - 1
              ? () => {
                  const nextCard = activePreset.cards[inspectIndex + 1];
                  handleInspectCard(nextCard.id, nextCard.name, nextCard.points, inspectIndex + 1);
                }
              : undefined
          }
          onPrev={
            inspectIndex > 0
              ? () => {
                  const prevCard = activePreset.cards[inspectIndex - 1];
                  handleInspectCard(prevCard.id, prevCard.name, prevCard.points, inspectIndex - 1);
                }
              : undefined
          }
          currentIndex={inspectIndex >= 0 ? inspectIndex : undefined}
          totalCards={activePreset.cards.length}
          deckSection={activePreset.name}
        />
      )}
    </div>
  );
}
