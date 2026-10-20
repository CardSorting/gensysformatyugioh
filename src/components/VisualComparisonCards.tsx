'use client';

import React from 'react';

interface ComparisonPoint {
  id: string;
  dimension: string;
  icon: string;
  advanced: {
    badge: string;
    headline: string;
    subPoints: string[];
  };
  genesys: {
    badge: string;
    headline: string;
    subPoints: string[];
  };
}

const COMPARISONS: ComparisonPoint[] = [
  {
    id: 'deckbuilding',
    dimension: 'Deckbuilding System',
    icon: '⚡',
    advanced: {
      badge: 'RIGID BANLIST',
      headline: 'Forbidden / Limited / Semi',
      subPoints: [
        'Cards are binary: 100% legal or 100% banned',
        'No point flexibility across deck zones',
      ],
    },
    genesys: {
      badge: '100-POINT WALLET',
      headline: 'Flexible Point Economy',
      subPoints: [
        'Spend 100 points across Main, Extra & Side',
        'Up to 3 copies allowed if budget permits',
      ],
    },
  },
  {
    id: 'tempo',
    dimension: 'Turn Pace & Gameplay',
    icon: '⏳',
    advanced: {
      badge: 'SOLITAIRE COMBOS',
      headline: '15-Minute Turn 1 Sequences',
      subPoints: [
        '20+ special summons per turn',
        'Boards end on multiple generic omni-negates',
      ],
    },
    genesys: {
      badge: 'DELIBERATE DUELING',
      headline: 'Tactical Turn Interactions',
      subPoints: [
        'Zero Link-climbing combo loops',
        'Meaningful back-and-forth decision making',
      ],
    },
  },
  {
    id: 'battlefield',
    dimension: 'Field Architecture',
    icon: '🏟️',
    advanced: {
      badge: 'EXTRA MONSTER ZONES',
      headline: 'EMZs & Link Arrow Geometry',
      subPoints: [
        'Mandatory Extra Monster Zones (EMZs)',
        'Complex co-linking arrow constraints',
      ],
    },
    genesys: {
      badge: 'CLASSIC 5×5 FIELD',
      headline: 'Restored Original Layout',
      subPoints: [
        'Classic 5 Monster & 5 Spell/Trap Zones',
        'Summon Fusion/Synchro/Xyz directly anywhere',
      ],
    },
  },
  {
    id: 'variety',
    dimension: 'Archetype Diversity',
    icon: '🔓',
    advanced: {
      badge: 'HOMOGENOUS STAPLES',
      headline: '15–25 Mandatory Hand Traps',
      subPoints: [
        'Every deck runs identical staple lineups',
        'Strict tier-1 engine dominance',
      ],
    },
    genesys: {
      badge: '10,000+ FREE CARDS',
      headline: 'Unrestricted Archetype Freedom',
      subPoints: [
        'All unlisted cards cost 0 points to run',
        'Nostalgic & modern decks duel on even footing',
      ],
    },
  },
];

export function VisualComparisonCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {COMPARISONS.map(c => (
        <div
          key={c.id}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-bright)',
            borderRadius: 14,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="hover-card"
        >
          {/* Dimension Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: 800 }}>
              {c.dimension}
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Genesys (Top / Highlight) */}
            <div
              style={{
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                borderRadius: 10,
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'rgba(0, 240, 255, 0.2)',
                    color: 'var(--color-cyan)',
                  }}
                >
                  ⚡ GENESYS
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: 'var(--color-cyan)' }}>
                  {c.genesys.badge}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                {c.genesys.headline}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {c.genesys.subPoints.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.75rem', color: '#e2e8f0' }}>
                    <span style={{ color: 'var(--color-cyan)', fontWeight: 800 }}>✓</span>
                    <span style={{ lineHeight: 1.35 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Advanced (Bottom / Contrast) */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-dim)',
                  }}
                >
                  ADVANCED FORMAT
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                  {c.advanced.badge}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                {c.advanced.headline}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {c.advanced.subPoints.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>✕</span>
                    <span style={{ lineHeight: 1.3 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
