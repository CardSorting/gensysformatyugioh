'use client';

import React, { useState } from 'react';

interface Term {
  id: string;
  chipLabel: string;
  icon: string;
  title: string;
  definition: string;
  officialRuleRef: string;
}

const TERMS: Term[] = [
  {
    id: 'budget-cap',
    chipLabel: '100-Point Budget',
    icon: '⚡',
    title: 'The 100-Point Deckbuilding Cap',
    definition:
      'The sum of all point-bearing cards in your Main Deck (40–60), Extra Deck (0–15), and Side Deck (0–15) combined cannot exceed 100 points. After side decking between games, the 100-point ceiling must still be respected.',
    officialRuleRef: 'Official Rule 3: Deck construction uses a point system. The total point cost cannot exceed the event cap.',
  },
  {
    id: 'zero-points',
    chipLabel: '0-Point Pool',
    icon: '🔓',
    title: 'The Free Zero-Point Pool',
    definition:
      'Any legal Yu-Gi-Oh! TCG card that does NOT appear on the official Genesys Point List costs exactly 0 points. Over 10,000+ cards are 0 points, meaning your archetype’s core engine is completely free.',
    officialRuleRef: 'Official Rule 3: Most cards cost zero points.',
  },
  {
    id: 'no-links-pendulums',
    chipLabel: 'No Links or Pendulums',
    icon: '🚫',
    title: 'Prohibition of Link and Pendulum Monsters',
    definition:
      'Neither Link Monsters nor Pendulum Monsters are permitted in Genesys (in Main or Extra decks). This eliminates Extra Monster Zones, complex scale mechanics, and multi-negate link-climbing solitaire combos.',
    officialRuleRef: 'Official Rule 1: No Link Monsters or Pendulum Monsters are allowed. All other cards are allowed.',
  },
  {
    id: 'battlefield-5x5',
    chipLabel: 'Classic 5×5 Board',
    icon: '🏟️',
    title: 'Original Classic Field Layout',
    definition:
      'Dueling is played on the original field layout consisting of 5 Main Monster Zones, 5 Spell & Trap Zones, 1 Field Zone, Graveyard, Main Deck, and Extra Deck. All Extra Deck summons go directly to any open Monster Zone.',
    officialRuleRef: 'Official Rule 1: The original field layout is used, with no Extra Monster Zones nor Pendulum Zones.',
  },
  {
    id: 'three-copies',
    chipLabel: 'Up to 3x Copies',
    icon: '📦',
    title: 'Flexible Copy Limits (Up to 3 Max)',
    definition:
      'Standard Forbidden & Limited banlists do not exist. Any card not forbidden by mechanic can be played up to 3 copies, provided your total deck points remain within budget (e.g. 3x A Hero Lives at 30 pts = 90 pts).',
    officialRuleRef: 'Official Rule 2: The standard Forbidden & Limited list is not used. Limit of 3 copies max still applies.',
  },
  {
    id: 'neuron-app',
    chipLabel: 'NEURON Validation',
    icon: '📱',
    title: 'Official Konami NEURON App Support',
    definition:
      'Konami has baked native Genesys support into the official Yu-Gi-Oh! NEURON mobile app. You can create your deck, select "Genesys Format", and NEURON will automatically validate points and deck legalities.',
    officialRuleRef: 'Konami NEURON Official Deck Construction Guidelines (PDF).',
  },
  {
    id: 'custom-caps',
    chipLabel: 'OTS Custom Caps',
    icon: '🏪',
    title: 'Official Tournament Store Custom Caps',
    definition:
      'While 100 points is the premier competitive standard, Konami sanctions local stores to host events with customized point caps, such as 50-point caps, 20-point caps, or pure 0-point budget tournaments.',
    officialRuleRef: 'Official Rule 4: Official Tournament Stores can set their own caps for their tournaments.',
  },
];

export function TerminologyChips() {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(TERMS[0]);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 14,
        padding: '20px 18px',
        marginBottom: 28,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>
          Interactive Glossary &bull; Click any concept to view official rule:
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
          7 Core Principles
        </span>
      </div>

      {/* Chips Row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {TERMS.map(term => {
          const isSelected = selectedTerm?.id === term.id;
          return (
            <button
              key={term.id}
              onClick={() => setSelectedTerm(isSelected ? null : term)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                background: isSelected ? 'var(--bg-surface-raised)' : 'var(--bg-primary)',
                border: isSelected ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                fontSize: '0.775rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span>{term.icon}</span>
              <span>{term.chipLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Definition Box */}
      {selectedTerm && (
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-bright)',
            borderRadius: 10,
            padding: '14px 16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '1.1rem' }}>{selectedTerm.icon}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              {selectedTerm.title}
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#e2e8f0', lineHeight: 1.5, margin: '0 0 8px 0' }}>
            {selectedTerm.definition}
          </p>
          <div
            style={{
              fontSize: '0.725rem',
              color: 'var(--color-cyan)',
              fontFamily: 'var(--font-mono)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 8,
            }}
          >
            📜 {selectedTerm.officialRuleRef}
          </div>
        </div>
      )}
    </div>
  );
}
