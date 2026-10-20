'use client';

import React, { useState } from 'react';
import { getProxiedImageUrl } from '@/lib/images';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

interface ShowcaseCard {
  id: number;
  name: string;
  points: number;
  badge: string;
  badgeColor: string;
  role: string;
}

interface OntologyNode {
  id: 'wallet' | 'main' | 'extra' | 'side' | 'free' | 'bans' | 'field';
  label: string;
  icon: string;
  badge: string;
  badgeColor: string;
  summary: string;
  ruleTag: string;
  metrics: Array<{ label: string; value: string }>;
  cards: ShowcaseCard[];
}

const NODES: Record<string, OntologyNode> = {
  wallet: {
    id: 'wallet',
    label: '100-Pt Budget Wallet',
    icon: '⚡',
    badge: 'CENTRAL ECONOMY',
    badgeColor: 'var(--color-cyan)',
    summary: 'The single financial currency that unifies your entire deck. Every card has a point cost from 0 to 100.',
    ruleTag: 'Rule 3 • Point Cap',
    metrics: [
      { label: 'Total Cap', value: '100 PTS' },
      { label: 'Deck Scope', value: 'Main + Extra + Side' },
      { label: 'Max Single Card', value: '100 PTS' },
      { label: 'Unlisted Cost', value: '0 PTS' },
    ],
    cards: [
      { id: 21044178, name: 'Abyss Dweller', points: 100, badge: '100 PTS', badgeColor: '#ef4444', role: 'All-In Floodgate' },
      { id: 55144522, name: 'Pot of Greed', points: 20, badge: '20 PTS', badgeColor: 'var(--color-cyan)', role: 'Iconic Draw 2' },
      { id: 14558127, name: 'Ash Blossom', points: 18, badge: '18 PTS', badgeColor: '#38bdf8', role: 'Universal Hand Trap' },
      { id: 89631139, name: 'Blue-Eyes Dragon', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: '100% Free Core' },
    ],
  },
  main: {
    id: 'main',
    label: 'Main Deck Compartment',
    icon: '🃏',
    badge: '40–60 CARDS',
    badgeColor: '#38bdf8',
    summary: 'Houses your core engine, combo starters, consistency searchers, and primary interaction staples.',
    ruleTag: 'Rule 2 • Main Deck',
    metrics: [
      { label: 'Card Count', value: '40–60 Cards' },
      { label: 'Max Copies', value: 'Up to 3x' },
      { label: 'Typical Spend', value: '50–75 PTS' },
      { label: 'Remaining', value: 'For Extra/Side' },
    ],
    cards: [
      { id: 8949584, name: 'A Hero Lives', points: 30, badge: '30 PTS', badgeColor: '#f59e0b', role: 'Engine Starter' },
      { id: 55144522, name: 'Pot of Greed', points: 20, badge: '20 PTS', badgeColor: 'var(--color-cyan)', role: 'Draw Power' },
      { id: 14558127, name: 'Ash Blossom', points: 18, badge: '18 PTS', badgeColor: '#38bdf8', role: 'Hand Interaction' },
      { id: 70095154, name: 'Cyber Dragon', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'Free Core Engine' },
    ],
  },
  extra: {
    id: 'extra',
    label: 'Extra Deck Compartment',
    icon: '🔮',
    badge: '0–15 CARDS',
    badgeColor: '#c084fc',
    summary: 'Fusion, Synchro, and Xyz bosses only. Link Monsters are strictly banned. Summons directly to any open Monster Zone.',
    ruleTag: 'Rule 1 & 2 • Extra Deck',
    metrics: [
      { label: 'Card Count', value: '0–15 Cards' },
      { label: 'Legal Types', value: 'Fusion / Synchro / Xyz' },
      { label: 'Illegal Types', value: '0 Links / 0 Pendulums' },
      { label: 'Summon Zone', value: 'Any Monster Zone' },
    ],
    cards: [
      { id: 10443958, name: 'Cyber Dragon Infinity', points: 33, badge: '33 PTS', badgeColor: '#c084fc', role: 'Xyz Omni-Negate' },
      { id: 21044178, name: 'Abyss Dweller', points: 100, badge: '100 PTS', badgeColor: '#ef4444', role: '100-Pt Extra Boss' },
      { id: 87746184, name: 'Albion the Branded Dragon', points: 5, badge: '5 PTS', badgeColor: '#34d399', role: 'Fusion Bridge' },
      { id: 42410161, name: 'Angelechy Shatranga', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'Free Extra Boss' },
    ],
  },
  side: {
    id: 'side',
    label: 'Side Deck Compartment',
    icon: '🛡️',
    badge: '0–15 CARDS',
    badgeColor: 'var(--color-gold-light)',
    summary: 'Tactical silver-bullet counter cards for Games 2 & 3. Side deck card points count toward the 100-point total during registration.',
    ruleTag: 'Rule 3 • Side Deck',
    metrics: [
      { label: 'Card Count', value: '0–15 Cards' },
      { label: 'Point Invariant', value: 'Counts in 100 PTS' },
      { label: 'Mid-Match Swap', value: 'Must Remain ≤ 100' },
      { label: 'Typical Spend', value: '10–20 PTS' },
    ],
    cards: [
      { id: 12580477, name: 'Raigeki', points: 2, badge: '2 PTS', badgeColor: '#10b981', role: 'Budget Board Breaker' },
      { id: 6368038, name: 'Triple Tactics Talent', points: 20, badge: '20 PTS', badgeColor: 'var(--color-cyan)', role: 'Going-Second Tech' },
      { id: 43898403, name: 'Agido the Sentinel', points: 33, badge: '33 PTS', badgeColor: '#f59e0b', role: 'Graveyard Tech' },
    ],
  },
  free: {
    id: 'free',
    label: '0-Point Free Pool',
    icon: '🔓',
    badge: '10,000+ CARDS',
    badgeColor: '#10b981',
    summary: 'All TCG cards not on the official point list cost exactly 0 points. Build your beloved archetypes with 0 budget penalties.',
    ruleTag: 'Universal Invariant',
    metrics: [
      { label: 'Free Pool', value: '10,000+ Cards' },
      { label: 'Point Cost', value: '0 PTS' },
      { label: 'Archetype Cores', value: '100% Free' },
      { label: 'Copy Limit', value: 'Standard 3x' },
    ],
    cards: [
      { id: 89631139, name: 'Blue-Eyes Dragon', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'Classic Boss' },
      { id: 70095154, name: 'Cyber Dragon', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'Machine Engine' },
      { id: 74509280, name: 'Tenpai Dragon', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'Modern Dragon Core' },
      { id: 58916810, name: 'Crackle Blitzclique', points: 0, badge: '0 PTS', badgeColor: '#10b981', role: 'YCS #1 Core Monster' },
    ],
  },
  bans: {
    id: 'bans',
    label: 'Format Mechanic Bans',
    icon: '🚫',
    badge: '0 LINKS • 0 PENDULUMS',
    badgeColor: '#ef4444',
    summary: 'Link Monsters and Pendulum Monsters are strictly illegal in Genesys. No link markers, no extra monster zones, no scales.',
    ruleTag: 'Rule 1 • Mechanic Bans',
    metrics: [
      { label: 'Link Monsters', value: '100% BANNED' },
      { label: 'Pendulum Monsters', value: '100% BANNED' },
      { label: 'Extra Monster Zones', value: 'REMOVED' },
      { label: 'Scale Math', value: 'ELIMINATED' },
    ],
    cards: [
      { id: 98978921, name: 'Link Monsters', points: 0, badge: 'BANNED', badgeColor: '#ef4444', role: 'Zero Allowed' },
      { id: 16178681, name: 'Pendulum Monsters', points: 0, badge: 'BANNED', badgeColor: '#ef4444', role: 'Zero Allowed' },
      { id: 87746184, name: 'Fusion / Synchro / Xyz', points: 5, badge: 'LEGAL', badgeColor: '#10b981', role: 'Fully Supported' },
    ],
  },
};

export function VisualOntologyDiagram() {
  const [activeNodeKey, setActiveNodeKey] = useState<string>('wallet');
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const [inspectIndex, setInspectIndex] = useState<number>(-1);

  const activeNode = NODES[activeNodeKey] || NODES.wallet;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Interactive Visual Ontology Architecture Map */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: '16px',
        }}
      >
        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>
          ⚡ Click Any System Layer to Inspect Architectural Ontology:
        </div>

        {/* Level 1: Central Root (The 100-Point Wallet Hub) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <button
            onClick={() => setActiveNodeKey('wallet')}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              background: activeNodeKey === 'wallet' ? 'rgba(0, 240, 255, 0.2)' : 'var(--bg-primary)',
              border: activeNodeKey === 'wallet' ? '2px solid var(--color-cyan)' : '1px solid var(--border-medium)',
              boxShadow: activeNodeKey === 'wallet' ? '0 0 20px rgba(0, 240, 255, 0.35)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>⚡</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', fontWeight: 800 }}>
                CENTRAL ECONOMY ROOT
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>
                100-Point Budget Wallet
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(0, 240, 255, 0.25)',
                color: 'var(--color-cyan)',
              }}
            >
              RULE 3
            </span>
          </button>
        </div>

        {/* Connecting SVG Flow Lines */}
        <div style={{ display: 'flex', justifyContent: 'center', height: 20, alignItems: 'center' }}>
          <div style={{ width: '70%', height: 2, background: 'linear-gradient(90deg, #38bdf8, #c084fc, #f59e0b)' }} />
        </div>

        {/* Level 2: The Tri-Deck Compartments (Main, Extra, Side) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            { key: 'main', label: 'Main Deck', icon: '🃏', size: '40–60 Cards', color: '#38bdf8' },
            { key: 'extra', label: 'Extra Deck', icon: '🔮', size: '0–15 Cards (No Links)', color: '#c084fc' },
            { key: 'side', label: 'Side Deck', icon: '🛡️', size: '0–15 Cards', color: '#f59e0b' },
          ].map(comp => {
            const isSelected = activeNodeKey === comp.key;
            return (
              <button
                key={comp.key}
                onClick={() => setActiveNodeKey(comp.key)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: isSelected ? `${comp.color}22` : 'var(--bg-primary)',
                  border: isSelected ? `2px solid ${comp.color}` : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? `0 0 16px ${comp.color}33` : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{comp.icon}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? comp.color : '#fff' }}>
                    {comp.label}
                  </div>
                  <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>
                    {comp.size}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Level 3: Format Invariants (Free Core, Bans) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 10,
          }}
        >
          <button
            onClick={() => setActiveNodeKey('free')}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: activeNodeKey === 'free' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)',
              border: activeNodeKey === 'free' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🔓</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: activeNodeKey === 'free' ? '#34d399' : '#fff' }}>
                10,000+ Unlisted Cards
              </div>
              <div style={{ fontSize: '0.675rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                100% FREE (0 PTS)
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveNodeKey('bans')}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: activeNodeKey === 'bans' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-primary)',
              border: activeNodeKey === 'bans' ? '2px solid #ef4444' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🚫</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: activeNodeKey === 'bans' ? '#f87171' : '#fff' }}>
                Format Bans
              </div>
              <div style={{ fontSize: '0.675rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                0 Links • 0 Pendulums
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Focused Ontology Inspector Pane */}
      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-bright)',
          borderRadius: 12,
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>{activeNode.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 900 }}>
                  {activeNode.label}
                </h4>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: `${activeNode.badgeColor}22`,
                    color: activeNode.badgeColor,
                    fontWeight: 800,
                  }}
                >
                  {activeNode.badge}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {activeNode.summary}
              </p>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-dim)',
            }}
          >
            {activeNode.ruleTag}
          </span>
        </div>

        {/* Metric Chips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 8,
            marginBottom: 14,
          }}
        >
          {activeNode.metrics.map(m => (
            <div
              key={m.label}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '6px 10px',
              }}
            >
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Visual Card Showcase */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Visual Examples (Click to Inspect Card Effect):
            </span>
            <span style={{ fontSize: '0.675rem', color: 'var(--color-cyan)' }}>
              🔍 Click any card →
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
              gap: 10,
            }}
          >
            {activeNode.cards.map((c, idx) => {
              const thumb = getProxiedImageUrl(c.id, 'cropped');
              return (
                <div
                  key={c.name}
                  onClick={() => handleInspect(c.id, c.name, c.points, idx)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover-card"
                  title={`Click to inspect ${c.name} (${c.points} pts) — View full text & stats`}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = c.badgeColor;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 56,
                      borderRadius: 5,
                      overflow: 'hidden',
                      background: '#040608',
                      border: `1.5px solid ${c.badgeColor}`,
                      flexShrink: 0,
                    }}
                  >
                    {thumb ? (
                      <img src={thumb} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🃏</div>
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: 3,
                        background: `${c.badgeColor}22`,
                        color: c.badgeColor,
                        border: `1px solid ${c.badgeColor}44`,
                        display: 'inline-block',
                        marginBottom: 2,
                      }}
                    >
                      {c.badge}
                    </span>
                    <div style={{ fontSize: '0.775rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 1 }}>
                      {c.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
            inspectIndex < activeNode.cards.length - 1
              ? () => {
                  const next = activeNode.cards[inspectIndex + 1];
                  handleInspect(next.id, next.name, next.points, inspectIndex + 1);
                }
              : undefined
          }
          onPrev={
            inspectIndex > 0
              ? () => {
                  const prev = activeNode.cards[inspectIndex - 1];
                  handleInspect(prev.id, prev.name, prev.points, inspectIndex - 1);
                }
              : undefined
          }
          currentIndex={inspectIndex >= 0 ? inspectIndex : undefined}
          totalCards={activeNode.cards.length}
          deckSection={activeNode.label}
        />
      )}
    </div>
  );
}
