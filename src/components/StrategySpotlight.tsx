'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getProxiedImageUrl } from '@/lib/images';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

interface ArchetypeStrategy {
  id: string;
  archetype: string;
  playerName: string;
  rankLabel: string;
  pointsTotal: number;
  signatureCardId: number;
  signatureCardName: string;
  deckId: string;
  style: string;
  mainPts: number;
  extraPts: number;
  sidePts: number;
  summary: string;
  keyPicks: Array<{ name: string; pts: number }>;
}

const STRATEGIES: ArchetypeStrategy[] = [
  {
    id: 'blitzclique',
    archetype: 'Blitzclique',
    playerName: 'Enzo Fiallos',
    rankLabel: 'Champion • Rank #1',
    pointsTotal: 100,
    signatureCardId: 58916810,
    signatureCardName: 'Crackle Blitzclique',
    deckId: 'ycs-houston-2026-rank-1',
    style: 'High-Tempo Aggro & Thunder Engine',
    mainPts: 70,
    extraPts: 20,
    sidePts: 10,
    summary: 'Maximized the 100-pt ceiling with pinpoint precision. Invested 70 pts into game-ending starters while leveraging 0-pt Thunder extenders to sweep the Top 32.',
    keyPicks: [
      { name: 'Ash Blossom', pts: 18 },
      { name: 'Triple Tactics Talent', pts: 20 },
      { name: 'Forbidden Droplet', pts: 20 },
    ],
  },
  {
    id: 'angelechy',
    archetype: 'Angelechy',
    playerName: 'Juan Andrade',
    rankLabel: 'Finalist • Rank #2',
    pointsTotal: 99,
    signatureCardId: 42410161,
    signatureCardName: 'Angelechy Shatranga',
    deckId: 'ycs-houston-2026-rank-2',
    style: 'Fairy Combo & Resource Control',
    mainPts: 55,
    extraPts: 30,
    sidePts: 14,
    summary: 'Masterclass resource conservation, ending Swiss undefeated with a 99-pt allocation that left 1 point unspent while dominating graveyard interactions.',
    keyPicks: [
      { name: 'Agido Sentinel', pts: 33 },
      { name: 'Herald of Orange Light', pts: 10 },
      { name: 'Solemn Judgment', pts: 15 },
    ],
  },
  {
    id: 'tenpai',
    archetype: 'Tenpai Dragon',
    playerName: 'Top-Cut Competitor',
    rankLabel: 'Top 4 Semifinalist',
    pointsTotal: 95,
    signatureCardId: 74509280,
    signatureCardName: 'Tenpai Dragon Chundra',
    deckId: 'ycs-houston-2026-rank-4',
    style: 'Going-Second OTK & Board Wipes',
    mainPts: 45,
    extraPts: 35,
    sidePts: 15,
    summary: 'Core Tenpai monsters cost 0 points, freeing up all 95 points for devastating board breakers and high-impact Synchro bosses in the Battle Phase.',
    keyPicks: [
      { name: 'Lightning Storm', pts: 20 },
      { name: 'Raigeki', pts: 2 },
      { name: 'Black Rose Dragon', pts: 10 },
    ],
  },
  {
    id: 'voiceless',
    archetype: 'Voiceless Voice',
    playerName: 'Top-Cut Competitor',
    rankLabel: 'Top 8 Quarterfinalist',
    pointsTotal: 92,
    signatureCardId: 89463537,
    signatureCardName: 'Skull Guardian, Protector',
    deckId: 'ycs-houston-2026-rank-8',
    style: 'Ritual Protection & Omni-Negation',
    mainPts: 60,
    extraPts: 12,
    sidePts: 20,
    summary: 'Consistent Lo / Skull Guardian setups without requiring Link arrows. Used budget for defensive hand traps and specialized Side Deck silver bullets.',
    keyPicks: [
      { name: 'Pre-Preparation of Rites', pts: 15 },
      { name: 'Effect Veiler', pts: 10 },
      { name: 'Ghost Belle', pts: 10 },
    ],
  },
];

export function StrategySpotlight() {
  const [selectedId, setSelectedId] = useState<string>('blitzclique');
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const active = STRATEGIES.find(s => s.id === selectedId) || STRATEGIES[0];
  const thumbUrl = getProxiedImageUrl(active.signatureCardId, 'cropped');

  const handleInspect = (cardId: number, cardName: string, points = 0) => {
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
            <span>🏆</span>
            <span>Championship Case Studies &bull; YCS Houston 2026</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 800 }}>
            How Tournament Champions Spend Their 100 Points
          </h3>
        </div>

        <Link
          href="/tournaments/ycs-houston-2026"
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
          <span>All 32 Decklists in Hub</span>
          <span>→</span>
        </Link>
      </div>

      {/* Strategy Tabs */}
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
        {STRATEGIES.map(s => {
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: isSelected ? 'var(--bg-surface-raised)' : 'var(--bg-primary)',
                border: isSelected ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{s.archetype}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.675rem',
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isSelected ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? 'var(--color-cyan)' : 'var(--text-dim)',
                  fontWeight: 800,
                }}
              >
                {s.pointsTotal}/100 pts
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Strategy Card Layout */}
      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-bright)',
          borderRadius: 14,
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          alignItems: 'center',
        }}
      >
        {/* Left: Tactical Metrics & Budget Bar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--color-gold-light)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
              }}
            >
              {active.rankLabel}
            </span>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
              Pilot: <strong style={{ color: '#fff' }}>{active.playerName}</strong>
            </span>
          </div>

          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: '#fff',
              margin: '0 0 6px 0',
              fontWeight: 800,
            }}
          >
            {active.archetype} &bull; <span style={{ fontSize: '0.95rem', color: 'var(--color-cyan)' }}>{active.style}</span>
          </h4>

          {/* Visual Segmented Budget Bar */}
          <div style={{ margin: '14px 0 16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
              <span style={{ color: 'var(--color-cyan)' }}>Main: {active.mainPts} pts</span>
              <span style={{ color: '#c084fc' }}>Extra: {active.extraPts} pts</span>
              <span style={{ color: '#f59e0b' }}>Side: {active.sidePts} pts</span>
            </div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${active.mainPts}%`, background: 'var(--color-cyan)' }} />
              <div style={{ width: `${active.extraPts}%`, background: '#c084fc' }} />
              <div style={{ width: `${active.sidePts}%`, background: '#f59e0b' }} />
            </div>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '0 0 14px 0' }}>
            {active.summary}
          </p>

          {/* Key Pointed Cards Chips */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
              Pointed Card Investments (Click to Inspect):
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {active.keyPicks.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleInspect(0, c.name, c.pts)}
                  style={{
                    fontSize: '0.725rem',
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Inspect ${c.name} (${c.pts} pts)`}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-cyan)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>{c.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', fontWeight: 800 }}>
                    {c.pts}p
                  </span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>🔍</span>
                </button>
              ))}
            </div>
          </div>

          <Link
            href={`/tournaments/ycs-houston-2026/decks/${active.deckId}`}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            <span>View Full 70-Card List & Ratios →</span>
          </Link>
        </div>

        {/* Right: Signature Card Artwork Showcase */}
        <div
          onClick={() => handleInspect(active.signatureCardId, active.signatureCardName, 0)}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 12,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          className="hover-card"
          title={`Click to inspect ${active.signatureCardName}`}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#34d399';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              width: 80,
              height: 114,
              borderRadius: 8,
              overflow: 'hidden',
              background: '#040608',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            }}
          >
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={active.signatureCardName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🃏
              </div>
            )}
          </div>

          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'inline-block',
                marginBottom: 6,
              }}
            >
              SIGNATURE 0-PT ENGINE PIECE
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {active.signatureCardName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35, marginBottom: 6 }}>
              Unlisted archetype piece costing <strong>0 points</strong>, powering the championship engine.
            </div>
            <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🔍 Click to inspect card details →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Detail Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => setInspectCard(null)}
          deckSection="Championship Case Study"
        />
      )}
    </div>
  );
}
