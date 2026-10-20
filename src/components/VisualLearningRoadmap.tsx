'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getProxiedImageUrl } from '@/lib/images';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

interface StepData {
  step: string;
  badge: string;
  badgeColor: string;
  title: string;
  oneLiner: string;
  visualPreviewType: 'cards' | 'budget' | 'banned' | 'neuron';
  cards?: Array<{ id: number; name: string; tag: string; tagColor: string }>;
  checklist: string[];
  ctaText?: string;
  ctaHref?: string;
}

const ROADMAP_STEPS: StepData[] = [
  {
    step: '01',
    badge: 'STAGE 1 • FREE ENGINE',
    badgeColor: '#10b981',
    title: 'Choose Any Strategy Core (0 PTS)',
    oneLiner: 'Over 10,000+ unlisted cards cost 0 points. Build your core archetype completely free.',
    visualPreviewType: 'cards',
    cards: [
      { id: 70095154, name: 'Cyber Dragon', tag: '0 PTS', tagColor: '#10b981' },
      { id: 74509280, name: 'Tenpai Dragon', tag: '0 PTS', tagColor: '#10b981' },
      { id: 68468459, name: 'Branded Despia', tag: '0 PTS', tagColor: '#10b981' },
      { id: 89463537, name: 'Voiceless Voice', tag: '0 PTS', tagColor: '#10b981' },
    ],
    checklist: [
      'Pick any archetype you love',
      'Unlisted cards in TCG cost 0 pts',
      '40–60 Main Deck card minimum',
    ],
  },
  {
    step: '02',
    badge: 'STAGE 2 • BUDGET ALLOCATION',
    badgeColor: 'var(--color-cyan)',
    title: 'Allocate Your 100-Point Budget',
    oneLiner: 'Spend your points on iconic spells, hand traps, or bosses across Main, Extra, and Side.',
    visualPreviewType: 'budget',
    cards: [
      { id: 55144522, name: 'Pot of Greed', tag: '20 PTS', tagColor: 'var(--color-cyan)' },
      { id: 14558127, name: 'Ash Blossom', tag: '18 PTS', tagColor: 'var(--color-cyan)' },
      { id: 8949584, name: 'A Hero Lives', tag: '30 PTS', tagColor: '#f59e0b' },
    ],
    checklist: [
      'Main + Extra + Side ≤ 100 PTS',
      'Run up to 3 copies per card',
      'Points replace the standard banlist',
    ],
    ctaText: 'Browse Point List →',
    ctaHref: '/cards',
  },
  {
    step: '03',
    badge: 'STAGE 3 • FORMAT INTEGRITY',
    badgeColor: '#ef4444',
    title: 'Verify Zero Links or Pendulums',
    oneLiner: 'Link and Pendulum cards are banned format-wide. Duels use the classic 5×5 field without EMZs.',
    visualPreviewType: 'banned',
    cards: [
      { id: 98978921, name: 'Link Monsters', tag: 'BANNED', tagColor: '#ef4444' },
      { id: 16178681, name: 'Pendulums', tag: 'BANNED', tagColor: '#ef4444' },
    ],
    checklist: [
      '0 Link Monsters in all zones',
      '0 Pendulum Monsters in all zones',
      'Extra Deck monsters summon to any zone',
    ],
  },
  {
    step: '04',
    badge: 'STAGE 4 • DUEL READY',
    badgeColor: '#c084fc',
    title: 'Validate in NEURON & Play',
    oneLiner: 'Register your list in the official Konami NEURON app under "Genesys Format" and duel at your local OTS.',
    visualPreviewType: 'neuron',
    checklist: [
      'Select "Genesys" deck type in NEURON',
      'Automatic official point validation',
      'Find local OTS tournaments worldwide',
    ],
    ctaText: 'NEURON PDF Guide ↗',
    ctaHref: 'https://www.yugioh-card.com/en/downloads/neuron/NEURON-Building_a_Genesys_Deck.pdf',
  },
];

export function VisualLearningRoadmap() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const activeStep = ROADMAP_STEPS[activeStepIndex];

  const handleInspectCard = (cardId: number, cardName: string) => {
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
      points: 0,
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
      {/* Step Progress Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
          marginBottom: 24,
        }}
      >
        {ROADMAP_STEPS.map((s, idx) => {
          const isActive = idx === activeStepIndex;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStepIndex(idx)}
              style={{
                background: isActive ? 'var(--bg-surface-raised)' : 'var(--bg-primary)',
                border: isActive ? `1.5px solid ${s.badgeColor}` : '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: isActive ? s.badgeColor : 'var(--text-dim)',
                  }}
                >
                  {s.step}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: isActive ? `${s.badgeColor}22` : 'rgba(255,255,255,0.05)',
                    color: isActive ? s.badgeColor : 'var(--text-dim)',
                  }}
                >
                  {s.badge.split(' • ')[1]}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  lineHeight: 1.3,
                }}
              >
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Visual Showcase */}
      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-bright)',
          borderRadius: 14,
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          alignItems: 'center',
        }}
      >
        {/* Left: Visual Preview Area */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: activeStep.badgeColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
            <span>STEP {activeStep.step} VISUAL AID</span>
          </div>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: '#fff',
              margin: '0 0 8px 0',
              fontWeight: 800,
            }}
          >
            {activeStep.title}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
            {activeStep.oneLiner}
          </p>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {activeStep.checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#e2e8f0' }}>
                <span style={{ color: activeStep.badgeColor, fontWeight: 800, fontSize: '0.9rem' }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {activeStep.ctaText && activeStep.ctaHref && (
            activeStep.ctaHref.startsWith('http') ? (
              <a
                href={activeStep.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                <span>{activeStep.ctaText}</span>
              </a>
            ) : (
              <Link
                href={activeStep.ctaHref}
                className="btn btn-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                <span>{activeStep.ctaText}</span>
              </Link>
            )
          )}
        </div>

        {/* Right: Dynamic Visual Mockup / Cards Display */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 12,
            padding: '16px',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {activeStep.visualPreviewType === 'cards' && activeStep.cards && (
            <div>
              <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 12, textAlign: 'center' }}>
                VISUAL CARD EXAMPLES (0 PTS • FREE POOL)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {activeStep.cards.map(c => {
                  const thumb = getProxiedImageUrl(c.id, 'cropped');
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleInspectCard(c.id, c.name)}
                      style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                      title={`Click to inspect ${c.name} — View card effects & stats`}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <div
                        style={{
                          aspectRatio: '1 / 1.45',
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#040608',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          marginBottom: 6,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🃏</div>
                        )}
                      </div>
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
                        }}
                      >
                        {c.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeStep.visualPreviewType === 'budget' && activeStep.cards && (
            <div>
              <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 10, textAlign: 'center' }}>
                SAMPLE BUDGET ALLOCATION: 68 / 100 PTS SPENT (CLICK TO INSPECT)
              </div>
              {/* Visual Meter */}
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #00f0ff, #f59e0b)', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {activeStep.cards.map(c => {
                  const thumb = getProxiedImageUrl(c.id, 'cropped');
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleInspectCard(c.id, c.name)}
                      style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                      title={`Click to inspect ${c.name} — View card effects & stats`}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <div
                        style={{
                          aspectRatio: '1 / 1.45',
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#040608',
                          border: `1px solid ${c.tagColor}`,
                          marginBottom: 6,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🃏</div>
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          fontWeight: 900,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: `${c.tagColor}22`,
                          color: c.tagColor,
                          border: `1px solid ${c.tagColor}55`,
                        }}
                      >
                        {c.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeStep.visualPreviewType === 'banned' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: '#fca5a5', marginBottom: 12 }}>
                STRICT FORMAT-WIDE BANS
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 14 }}>
                <div style={{ padding: '14px 20px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1.5px solid rgba(239, 68, 68, 0.5)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 4 }}>🚫</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fca5a5' }}>Link Monsters</div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>0 Allowed</div>
                </div>
                <div style={{ padding: '14px 20px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1.5px solid rgba(239, 68, 68, 0.5)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 4 }}>🚫</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fca5a5' }}>Pendulum Monsters</div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>0 Allowed</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                ✓ Fusion, Synchro, Xyz & Ritual Monsters are 100% Legal
              </div>
            </div>
          )}

          {activeStep.visualPreviewType === 'neuron' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: 'rgba(192, 132, 252, 0.15)', border: '1px solid rgba(192, 132, 252, 0.4)', marginBottom: 14 }}>
                <span style={{ fontSize: '1.2rem' }}>📱</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc' }}>KONAMI NEURON APP</span>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 10, padding: '12px', maxWidth: 280, margin: '0 auto 12px auto' }}>
                <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 800, letterSpacing: '0.5px' }}>
                  ✓ STATUS: VALIDATED
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
                  Genesys Format Deck (100/100 PTS)
                </div>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                Official tournament-compliant deck sheet
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Detail Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => setInspectCard(null)}
          deckSection="Learning Roadmap"
        />
      )}
    </div>
  );
}
