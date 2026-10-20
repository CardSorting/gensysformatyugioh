'use client';

import React from 'react';
import Link from 'next/link';

interface PointTier {
  id: string;
  rangeLabel: string;
  pointsQuery: string;
  cardCount: number;
  badgeColor: string;
  title: string;
  description: string;
  examples: string[];
}

const TIERS: PointTier[] = [
  {
    id: '100-pts',
    rangeLabel: '100 PTS',
    pointsQuery: '100',
    cardCount: 105,
    badgeColor: '#ef4444',
    title: 'Forbidden-Class Titans',
    description: 'Format-defining floodgates and game-enders that consume your entire 100-point budget.',
    examples: ['Abyss Dweller', 'Pot of Greed', 'Painful Choice', 'Graceful Charity'],
  },
  {
    id: '50-99-pts',
    rangeLabel: '50–99 PTS',
    pointsQuery: '50-99',
    cardCount: 75,
    badgeColor: '#f97316',
    title: 'High-Impact Powerhouses',
    description: 'Powerful extra deck bosses and game-altering spells requiring significant deck compromises.',
    examples: ['That Grass Looks Greener', 'True King of All Calamities', 'Dimension Shifter'],
  },
  {
    id: '25-49-pts',
    rangeLabel: '25–49 PTS',
    pointsQuery: '25-49',
    cardCount: 76,
    badgeColor: '#f59e0b',
    title: 'Heavy Starters & Engines',
    description: 'Archetype consistency starters and potent graveyard bridges.',
    examples: ['A Hero Lives (30)', 'Agido the Ancient Sentinel (33)', 'Albion the Sanctifire (33)'],
  },
  {
    id: '10-24-pts',
    rangeLabel: '10–24 PTS',
    pointsQuery: '10-24',
    cardCount: 241,
    badgeColor: '#00f0ff',
    title: 'Universal Staples & Negates',
    description: 'The tactical backbone of modern interaction. Hand traps, negates, and utility removal.',
    examples: ['Ash Blossom (15)', 'Triple Tactics Talent (20)', 'Adamancipator Dragite (15)'],
  },
  {
    id: '1-9-pts',
    rangeLabel: '1–9 PTS',
    pointsQuery: '1-9',
    cardCount: 253,
    badgeColor: '#38bdf8',
    title: 'Lightly Taxed Utility',
    description: 'Minor taxes on strong archetype extenders and classic draw engines.',
    examples: ['Albion the Branded Dragon (5)', 'Aleister (4)', 'Allure of Darkness (3)'],
  },
  {
    id: '0-pts',
    rangeLabel: '0 PTS',
    pointsQuery: '0',
    cardCount: 10000,
    badgeColor: '#10b981',
    title: 'Free Unlisted Card Pool',
    description: 'Any legal TCG card not on the official point sheet costs zero. Pure archetypes build free.',
    examples: ['Blue-Eyes White Dragon', 'Dark Magician', 'Cyber Dragon', 'Tenpai In-Engine'],
  },
];

export function PointTierExplorer() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
      }}
    >
      {TIERS.map(tier => (
        <div
          key={tier.id}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 14,
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="hover-card"
        >
          <div>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  padding: '3px 9px',
                  borderRadius: 8,
                  background: `${tier.badgeColor}22`,
                  color: tier.badgeColor,
                  border: `1px solid ${tier.badgeColor}66`,
                }}
              >
                {tier.rangeLabel}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {tier.cardCount > 1000 ? '10,000+ Cards' : `${tier.cardCount} Published Cards`}
              </span>
            </div>

            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                color: '#fff',
                margin: '0 0 6px 0',
                fontWeight: 800,
              }}
            >
              {tier.title}
            </h4>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              {tier.description}
            </p>

            {/* Sample Cards Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {tier.examples.map(ex => (
                <span
                  key={ex}
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>

          {/* Direct link to filter in CardGallery */}
          <Link
            href={`/cards?points=${tier.pointsQuery}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--color-cyan)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Browse {tier.rangeLabel} Cards in Visualizer</span>
            <span>→</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
