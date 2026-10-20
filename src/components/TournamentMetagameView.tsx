'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TournamentData, TournamentDeck } from '@/types/tournament';
import { getDeckThumbnailUrl } from '@/lib/images';

export const ARCHETYPE_PALETTE: Record<string, { main: string; glow: string; bg: string }> = {
  'Angelechy Blitzclique': { main: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', bg: 'rgba(0, 240, 255, 0.12)' },
  'Blitzclique': { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.12)' },
  'Angelechy Centur-Ion': { main: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.12)' },
  'Angelechy': { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', bg: 'rgba(56, 189, 248, 0.12)' },
  'Magistus Fairy Tail': { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.12)' },
  'Ancient Fairy Angelechy': { main: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', bg: 'rgba(236, 72, 153, 0.12)' },
  'Radiant Typhoon': { main: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', bg: 'rgba(249, 115, 22, 0.12)' },
  'Voiceless Voice': { main: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)', bg: 'rgba(20, 184, 166, 0.12)' },
  'Horus': { main: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', bg: 'rgba(234, 179, 8, 0.12)' },
  'Centur-Ion': { main: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', bg: 'rgba(99, 102, 241, 0.12)' },
  'Predaplant True Draco': { main: '#84cc16', glow: 'rgba(132, 204, 22, 0.4)', bg: 'rgba(132, 204, 22, 0.12)' },
  'Dinosaur GMX': { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', bg: 'rgba(239, 68, 68, 0.12)' },
  'Snake-Eye Fire King': { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.12)' },
  'Blitzclique Ashtra': { main: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)', bg: 'rgba(217, 70, 239, 0.12)' },
};

const DEFAULT_COLOR_LIST = [
  { main: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', bg: 'rgba(0, 240, 255, 0.12)' },
  { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.12)' },
  { main: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.12)' },
  { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.12)' },
  { main: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', bg: 'rgba(236, 72, 153, 0.12)' },
  { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', bg: 'rgba(56, 189, 248, 0.12)' },
  { main: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', bg: 'rgba(249, 115, 22, 0.12)' },
  { main: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)', bg: 'rgba(20, 184, 166, 0.12)' },
  { main: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', bg: 'rgba(139, 92, 246, 0.12)' },
  { main: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', bg: 'rgba(234, 179, 8, 0.12)' },
];

export function getArchetypePalette(archetype: string, index = 0) {
  if (ARCHETYPE_PALETTE[archetype]) return ARCHETYPE_PALETTE[archetype];
  return DEFAULT_COLOR_LIST[index % DEFAULT_COLOR_LIST.length];
}

export interface ArchetypeMetaItem {
  archetype: string;
  count: number;
  percentage: number;
  decks: TournamentDeck[];
  bestRank: number;
  bestDeck: TournamentDeck;
  color: { main: string; glow: string; bg: string };
  tierLabel: 'Tier 1' | 'Tier 1.5' | 'Tier 2' | 'Rogue / Tech';
  tierBadgeColor: { bg: string; border: string; text: string };
}

interface TournamentMetagameViewProps {
  tournament: TournamentData;
  activeArchetype: string;
  onSelectArchetype: (archetype: string) => void;
}

export function TournamentMetagameView({
  tournament,
  activeArchetype,
  onSelectArchetype,
}: TournamentMetagameViewProps) {
  const [displayMode, setDisplayMode] = useState<'cards' | 'bars' | 'tiers'>('cards');
  const [hoveredArchetype, setHoveredArchetype] = useState<string | null>(null);

  const totalDecksCount = tournament.decks.length;

  // Compute rich archetype metagame analytics
  const archetypeItems: ArchetypeMetaItem[] = useMemo(() => {
    const map = new Map<string, TournamentDeck[]>();
    for (const d of tournament.decks) {
      const list = map.get(d.archetype) || [];
      list.push(d);
      map.set(d.archetype, list);
    }

    const items: ArchetypeMetaItem[] = [];
    let idx = 0;

    map.forEach((deckList, archName) => {
      const count = deckList.length;
      const metaEntry = tournament.metagame?.find(m => m.archetype.toLowerCase() === archName.toLowerCase());
      const percentage = metaEntry
        ? metaEntry.percentage
        : Number(((count / (totalDecksCount || 1)) * 100).toFixed(1));

      const sortedDecks = [...deckList].sort((a, b) => a.rank - b.rank);
      const bestDeck = sortedDecks[0];
      const bestRank = bestDeck ? bestDeck.rank : 999;
      const color = getArchetypePalette(archName, idx);

      let tierLabel: ArchetypeMetaItem['tierLabel'] = 'Rogue / Tech';
      let tierBadgeColor = { bg: 'rgba(255, 255, 255, 0.08)', border: 'var(--border-subtle)', text: 'var(--text-muted)' };

      if (percentage >= 15) {
        tierLabel = 'Tier 1';
        tierBadgeColor = { bg: 'rgba(0, 240, 255, 0.2)', border: 'rgba(0, 240, 255, 0.6)', text: 'var(--color-cyan)' };
      } else if (percentage >= 8) {
        tierLabel = 'Tier 1.5';
        tierBadgeColor = { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.6)', text: 'var(--color-gold-light)' };
      } else if (percentage >= 5) {
        tierLabel = 'Tier 2';
        tierBadgeColor = { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.5)', text: '#34d399' };
      }

      items.push({
        archetype: archName,
        count,
        percentage,
        decks: sortedDecks,
        bestRank,
        bestDeck,
        color,
        tierLabel,
        tierBadgeColor,
      });

      idx++;
    });

    return items.sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return a.bestRank - b.bestRank;
    });
  }, [tournament.decks, tournament.metagame, totalDecksCount]);

  // Group into tiers for Tier Breakdown mode
  const tierGroups = useMemo(() => {
    return {
      tier1: archetypeItems.filter(i => i.tierLabel === 'Tier 1'),
      tier15: archetypeItems.filter(i => i.tierLabel === 'Tier 1.5'),
      tier2: archetypeItems.filter(i => i.tierLabel === 'Tier 2'),
      rogue: archetypeItems.filter(i => i.tierLabel === 'Rogue / Tech'),
    };
  }, [archetypeItems]);

  // Core archetypes (>= 5% share or > 1 deck) vs single-deck rogue innovators
  const coreArchetypes = useMemo(() => {
    return archetypeItems.filter(i => i.count > 1 || i.percentage >= 5);
  }, [archetypeItems]);

  const rogueArchetypes = useMemo(() => {
    return archetypeItems.filter(i => i.count === 1 && i.percentage < 5);
  }, [archetypeItems]);

  const metaLeader = archetypeItems[0];
  const championDeck = tournament.decks.find(d => d.rank === 1);

  const getPlacementBadge = (rank: number) => {
    if (rank === 1) return { text: '🏆 Champion (1st)', color: 'var(--color-gold-light)', bg: 'rgba(245, 158, 11, 0.2)' };
    if (rank === 2) return { text: '🥈 Finalist (2nd)', color: '#e2e8f0', bg: 'rgba(203, 213, 225, 0.15)' };
    if (rank <= 4) return { text: '🥉 Top 4', color: 'var(--color-cyan)', bg: 'rgba(56, 189, 248, 0.15)' };
    if (rank <= 8) return { text: 'Top 8', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)' };
    if (rank <= 16) return { text: 'Top 16', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' };
    return { text: `Top ${totalDecksCount} (#${rank})`, color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.08)' };
  };

  return (
    <section
      aria-label="Tournament Metagame Breakdown"
      style={{
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* 1. Unified Metagame Command Bar with Integrated Analytics */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Top Header Row: Metrics Ticker + View Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Metagame Distribution
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.675rem',
                padding: '2px 7px',
                borderRadius: 5,
                background: 'rgba(2, 132, 199, 0.2)',
                color: 'var(--color-cyan)',
                fontWeight: 700,
                border: '1px solid rgba(2, 132, 199, 0.4)',
              }}
            >
              {totalDecksCount} Qualified Decks
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.675rem',
                padding: '2px 7px',
                borderRadius: 5,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              {archetypeItems.length} Archetypes
            </span>
            {metaLeader && (
              <button
                onClick={() => onSelectArchetype(activeArchetype === metaLeader.archetype ? '' : metaLeader.archetype)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.675rem',
                  padding: '2px 8px',
                  borderRadius: 5,
                  background: activeArchetype === metaLeader.archetype ? metaLeader.color.bg : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${activeArchetype === metaLeader.archetype ? metaLeader.color.main : 'var(--border-subtle)'}`,
                  color: metaLeader.color.main,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={`Filter by dominant strategy: ${metaLeader.archetype} (${metaLeader.percentage}%)`}
              >
                <span>⚡ Leader: {metaLeader.archetype} ({metaLeader.percentage}%)</span>
                {activeArchetype === metaLeader.archetype && <span>✕</span>}
              </button>
            )}
            {championDeck && (
              <Link
                href={`/tournaments/${tournament.id}/decks/${championDeck.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.675rem',
                  padding: '2px 8px',
                  borderRadius: 5,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: 'var(--color-gold-light)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
                title={`Inspect Champion ${championDeck.name}'s Decklist`}
              >
                <span>🏆 Champion: {championDeck.name}</span>
                <span style={{ color: 'var(--text-dim)' }}>→</span>
              </Link>
            )}
          </div>

          {/* View Mode Toggle Controls */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setDisplayMode('cards')}
              style={{
                background: displayMode === 'cards' ? 'var(--bg-surface-raised)' : 'transparent',
                border: 'none',
                color: displayMode === 'cards' ? 'var(--color-cyan)' : 'var(--text-muted)',
                padding: '4px 9px',
                borderRadius: 4,
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Show compact visual metagame tier grid"
            >
              <span>🃏</span>
              <span>Tiers</span>
            </button>
            <button
              onClick={() => setDisplayMode('tiers')}
              style={{
                background: displayMode === 'tiers' ? 'var(--bg-surface-raised)' : 'transparent',
                border: 'none',
                color: displayMode === 'tiers' ? 'var(--color-cyan)' : 'var(--text-muted)',
                padding: '4px 9px',
                borderRadius: 4,
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Show structured competitive matrix"
            >
              <span>📊</span>
              <span>Matrix</span>
            </button>
            <button
              onClick={() => setDisplayMode('bars')}
              style={{
                background: displayMode === 'bars' ? 'var(--bg-surface-raised)' : 'transparent',
                border: 'none',
                color: displayMode === 'bars' ? 'var(--color-cyan)' : 'var(--text-muted)',
                padding: '4px 9px',
                borderRadius: 4,
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Show ranked metagame progress bars"
            >
              <span>📈</span>
              <span>Ranked Bars</span>
            </button>
          </div>
        </div>

        {/* Proportional Segmented Metagame Bar */}
        <div
          style={{
            height: 16,
            borderRadius: 6,
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {archetypeItems.map(item => {
            const isHovered = hoveredArchetype === item.archetype;
            const isSelected = activeArchetype === item.archetype;
            const widthPct = Math.max(item.percentage, 1.4);

            return (
              <div
                key={item.archetype}
                onClick={() => onSelectArchetype(activeArchetype === item.archetype ? '' : item.archetype)}
                onMouseEnter={() => setHoveredArchetype(item.archetype)}
                onMouseLeave={() => setHoveredArchetype(null)}
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  background: item.color.main,
                  opacity: activeArchetype && !isSelected ? 0.35 : isHovered ? 1 : 0.88,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderRight: '1px solid rgba(0,0,0,0.4)',
                  boxShadow: isSelected || isHovered ? `0 0 12px ${item.color.glow}` : 'none',
                }}
                title={`${item.archetype}: ${item.count} Decks (${item.percentage}%) • Best Finish: #${item.bestRank}`}
              />
            );
          })}
        </div>

        {/* Active Filter Pill or Prompt */}
        {activeArchetype && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', paddingTop: 2 }}>
            <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>
              Filtering roster by strategy: <strong>{activeArchetype}</strong>
            </span>
            <button
              onClick={() => onSelectArchetype('')}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '2px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.675rem',
                fontWeight: 700,
              }}
            >
              Clear Filter ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. Strategy Cards Mode: High-Density Ergonomic Visual Grid */}
      {displayMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Core Metagame Strategies (Tiers 1, 1.5, 2) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 10,
            }}
          >
            {coreArchetypes.map(item => {
              const isSelected = activeArchetype === item.archetype;
              const placement = getPlacementBadge(item.bestRank);
              const thumb = getDeckThumbnailUrl(item.bestDeck?.signatureCardId, item.bestDeck?.thumbnailUrl);

              return (
                <div
                  key={`core-${item.archetype}`}
                  onClick={() => onSelectArchetype(isSelected ? '' : item.archetype)}
                  className="glass-panel"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${item.color.main}` : '1px solid var(--border-subtle)',
                    background: isSelected ? item.color.bg : 'var(--bg-surface)',
                    boxShadow: isSelected ? `0 0 16px ${item.color.glow}` : 'var(--shadow-sm)',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = item.color.main;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 7,
                      overflow: 'hidden',
                      background: '#040608',
                      border: `1.5px solid ${item.color.main}`,
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    }}
                  >
                    {thumb ? (
                      <img src={thumb} alt={item.archetype} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🎴</div>
                    )}
                  </div>

                  {/* Info Column */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: item.tierBadgeColor.bg,
                          border: `1px solid ${item.tierBadgeColor.border}`,
                          color: item.tierBadgeColor.text,
                          fontWeight: 800,
                        }}
                      >
                        {item.tierLabel}
                      </span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: placement.bg,
                          color: placement.color,
                          fontWeight: 700,
                        }}
                      >
                        {placement.text}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: 0,
                        color: isSelected ? item.color.main : '#fff',
                        fontSize: '0.875rem',
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.archetype}
                    </h4>

                    {/* Progress Bar & Percentage */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${(item.percentage / (metaLeader ? metaLeader.percentage : 100)) * 100}%`,
                            height: '100%',
                            background: item.color.main,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900, color: item.color.main }}>
                        {item.percentage}%
                      </span>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                        ({item.count})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rogue Innovations Dock (13 Single-Pilot Tech Strategies) */}
          {rogueArchetypes.length > 0 && (
            <div
              className="glass-panel"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                borderLeft: '3px solid #a855f7',
                background: 'rgba(10, 15, 25, 0.95)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🛡️ Rogue Tech Innovations ({rogueArchetypes.length} Decks &bull; 1 Deck Each)
                </span>
                <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  40.6% Field Share
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                {rogueArchetypes.map(item => {
                  const isSelected = activeArchetype === item.archetype;
                  const thumb = getDeckThumbnailUrl(item.bestDeck?.signatureCardId, item.bestDeck?.thumbnailUrl);

                  return (
                    <button
                      key={`rogue-${item.archetype}`}
                      onClick={() => onSelectArchetype(isSelected ? '' : item.archetype)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: isSelected ? item.color.bg : 'var(--bg-primary)',
                        border: isSelected ? `1.5px solid ${item.color.main}` : '1px solid var(--border-subtle)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? `0 0 10px ${item.color.glow}` : 'none',
                      }}
                      title={`Filter by ${item.archetype} (${item.bestDeck?.name} • #${item.bestRank})`}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          overflow: 'hidden',
                          background: '#040608',
                          border: `1px solid ${item.color.main}`,
                          flexShrink: 0,
                        }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={item.archetype} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>🎴</div>
                        )}
                      </div>

                      <span style={{ fontSize: '0.725rem', fontWeight: 700, color: isSelected ? item.color.main : '#fff' }}>
                        {item.archetype}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        #{item.bestRank}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Tier Matrix Mode */}
      {displayMode === 'tiers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'tier1', title: 'TIER 1 (Dominant • ≥ 15% Share)', items: tierGroups.tier1, badgeColor: 'var(--color-cyan)', border: 'var(--color-cyan)' },
            { key: 'tier15', title: 'TIER 1.5 (High Contenders • 8% – 14.9%)', items: tierGroups.tier15, badgeColor: 'var(--color-gold-light)', border: 'rgba(245, 158, 11, 0.6)' },
            { key: 'tier2', title: 'TIER 2 (Proven Meta • 5% – 7.9%)', items: tierGroups.tier2, badgeColor: '#34d399', border: 'rgba(16, 185, 129, 0.5)' },
          ].map(group => {
            if (group.items.length === 0) return null;

            return (
              <div key={group.key} className="glass-panel" style={{ padding: '10px 14px', borderLeft: `3px solid ${group.border}` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: group.badgeColor, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                  {group.title}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                  {group.items.map(item => {
                    const isSelected = activeArchetype === item.archetype;
                    const placement = getPlacementBadge(item.bestRank);
                    const thumb = getDeckThumbnailUrl(item.bestDeck?.signatureCardId, item.bestDeck?.thumbnailUrl);

                    return (
                      <div
                        key={`tier-item-${item.archetype}`}
                        onClick={() => onSelectArchetype(isSelected ? '' : item.archetype)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          background: isSelected ? item.color.bg : 'var(--bg-primary)',
                          border: `1px solid ${isSelected ? item.color.main : 'var(--border-subtle)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 5, overflow: 'hidden', background: '#040608', border: `1px solid ${item.color.main}`, flexShrink: 0 }}>
                            {thumb ? (
                              <img src={thumb} alt={item.archetype} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>🎴</div>
                            )}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: isSelected ? item.color.main : '#fff', fontWeight: 700, fontSize: '0.775rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.archetype}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: placement.color, fontWeight: 700 }}>
                              {placement.text}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                          <div style={{ color: item.color.main, fontWeight: 800, fontSize: '0.8rem' }}>{item.percentage}%</div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>{item.count} decks</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Rogue Tray in Matrix */}
          {tierGroups.rogue.length > 0 && (
            <div className="glass-panel" style={{ padding: '10px 14px', borderLeft: '3px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                Rogue Tech ({tierGroups.rogue.length} Decks &bull; 1 Deck Each)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
                {tierGroups.rogue.map(item => {
                  const isSelected = activeArchetype === item.archetype;
                  const thumb = getDeckThumbnailUrl(item.bestDeck?.signatureCardId, item.bestDeck?.thumbnailUrl);
                  return (
                    <button
                      key={`tier-rogue-${item.archetype}`}
                      onClick={() => onSelectArchetype(isSelected ? '' : item.archetype)}
                      style={{
                        padding: '5px 7px',
                        borderRadius: 5,
                        background: isSelected ? item.color.bg : 'var(--bg-primary)',
                        border: isSelected ? `1px solid ${item.color.main}` : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.7rem',
                      }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: 3, overflow: 'hidden', background: '#040608', flexShrink: 0 }}>
                        {thumb ? <img src={thumb} alt={item.archetype} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                      </div>
                      <span style={{ color: isSelected ? item.color.main : '#fff', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.archetype}
                      </span>
                      <span style={{ color: 'var(--text-dim)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>#{item.bestRank}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Ranked Bars Mode */}
      {displayMode === 'bars' && (
        <div className="glass-panel" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {archetypeItems.map(item => {
              const isSelected = activeArchetype === item.archetype;
              const placement = getPlacementBadge(item.bestRank);

              return (
                <div
                  key={`bar-row-${item.archetype}`}
                  onClick={() => onSelectArchetype(isSelected ? '' : item.archetype)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: isSelected ? item.color.bg : 'transparent',
                    border: `1px solid ${isSelected ? item.color.main : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: '0.775rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color.main }} />
                      <span style={{ color: isSelected ? item.color.main : '#fff', fontWeight: 700 }}>
                        {item.archetype}
                      </span>
                      <span style={{ fontSize: '0.625rem', padding: '1px 4px', borderRadius: 3, background: placement.bg, color: placement.color, fontWeight: 700 }}>
                        {placement.text}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.count} {item.count === 1 ? 'deck' : 'decks'}</span>
                      <strong style={{ color: item.color.main }}>{item.percentage}%</strong>
                    </div>
                  </div>

                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${item.color.main}, ${item.color.glow})`,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
