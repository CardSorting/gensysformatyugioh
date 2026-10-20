'use client';

import React, { useState } from 'react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  details?: string[];
}

const FAQS: FaqItem[] = [
  {
    id: 'unlisted-cards',
    question: 'What happens if a card is not listed on the official Genesys Point List?',
    answer:
      'If a card does not appear on the official Genesys Point List, it costs exactly 0 points. You can run up to 3 copies of any unlisted legal card without consuming any of your 100-point budget.',
    details: [
      'Over 10,000+ Yu-Gi-Oh! cards are unlisted and cost 0 points.',
      'Most archetype-specific cards (e.g., Cyber Dragon, Blue-Eyes, Dark Magician, Tenpai, Branded) are 0 points.',
      'Only high-impact staples, generic floodgates, or format-warping combo pieces carry point values.',
    ],
  },
  {
    id: 'multiple-copies',
    question: 'Can I play multiple copies of a card that has a point value?',
    answer:
      'Yes! Unlike traditional Forbidden & Limited lists which cap copies at 1 or 2, Genesys allows up to the standard 3 copies of any legal card, provided the combined point total fits within your 100-point cap.',
    details: [
      'Example: "A Hero Lives" costs 30 points. Running 1 copy costs 30 pts; 2 copies cost 60 pts; 3 copies cost 90 pts.',
      'Example: A 100-point card like "Abyss Dweller" can only be run as a 1-of, because a second copy would push your deck to 200 points.',
    ],
  },
  {
    id: 'forbidden-list',
    question: 'Does Genesys use the standard Forbidden & Limited banlist?',
    answer:
      'No. The standard Yu-Gi-Oh! TCG Forbidden & Limited list is not used in Genesys. Formerly forbidden or limited cards are evaluated purely on point costs, except for Link and Pendulum monsters.',
    details: [
      'Any card with an assigned point value is legal up to 3 copies within budget.',
      'Link Monsters and Pendulum Monsters are strictly banned format-wide.',
      'Cards not released in the TCG or illegal for general tournament play remain illegal.',
    ],
  },
  {
    id: 'three-decks',
    question: 'Do Main, Extra, and Side Decks each get their own 100-point budget?',
    answer:
      'No. The 100-point budget is shared collectively across your Main Deck (40–60 cards), Extra Deck (0–15 cards), and Side Deck (0–15 cards).',
    details: [
      'The sum of all point-bearing cards in all three sections combined must be 100 or fewer points.',
      'During sided matches (Game 2 and Game 3), your deck must still remain at or below the 100-point limit after side decking!',
    ],
  },
  {
    id: 'custom-caps',
    question: 'Can tournament organizers and local stores set different point caps?',
    answer:
      'Yes! Konami officially sanctions flexible point caps. While 100 points is the premier competitive standard (used at YCS Houston), Official Tournament Stores (OTS) may host events with lower caps (e.g., 50 points, 20 points, or even a pure 0-point "Commons & Archetypes" tournament).',
  },
  {
    id: 'links-pendulums',
    question: 'Why are Link Monsters and Pendulum Monsters prohibited?',
    answer:
      'Konami designed Genesys to return to the original classic battlefield (5 Monster Zones, 5 Spell/Trap Zones, without Extra Monster Zones or Pendulum Zones). Banning Link Monsters eliminates lengthy generic link-climbing combos and brings back deliberate summoning and combat pacing.',
  },
  {
    id: 'neuron-registration',
    question: 'How do I build and submit a Genesys deck for official tournament play?',
    answer:
      'You can build, validate, and register your Genesys decklist directly in Konami\'s official Yu-Gi-Oh! NEURON mobile app. NEURON includes native Genesys format validation that automatically tallies your points and confirms format compliance.',
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>('unlisted-cards');

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {FAQS.map(item => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${isOpen ? 'rgba(0, 240, 255, 0.4)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              overflow: 'hidden',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
          >
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: isOpen ? '#fff' : 'var(--text-primary)',
                  transition: 'color 0.15s ease',
                }}
              >
                {item.question}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  color: isOpen ? 'var(--color-cyan)' : 'var(--text-dim)',
                  transition: 'transform 0.2s ease, color 0.15s ease',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  background: isOpen ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                }}
              >
                +
              </span>
            </button>

            {isOpen && (
              <div
                id={`faq-answer-${item.id}`}
                style={{
                  padding: '0 20px 18px 20px',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 14,
                }}
              >
                <p style={{ margin: '0 0 8px 0', color: '#e2e8f0' }}>{item.answer}</p>
                {item.details && item.details.length > 0 && (
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                    {item.details.map((detail, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
