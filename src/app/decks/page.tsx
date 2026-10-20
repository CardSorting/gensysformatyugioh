'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllTournaments, getAllDecksAcrossAllTournaments } from '@/lib/tournaments';
import { getDeckThumbnailUrl } from '@/lib/images';

const allTournaments = getAllTournaments();
const allDecksWithTournament = getAllDecksAcrossAllTournaments();

export default function DecksShowcasePage() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [archetypeFilter, setArchetypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'rank-asc' | 'rank-desc' | 'name-asc'>('rank-asc');

  // Filter list by selected tournament first
  const scopedDecks = useMemo(() => {
    if (selectedTournamentId === 'all') {
      return allDecksWithTournament;
    }
    return allDecksWithTournament.filter(item => item.tournament.id === selectedTournamentId);
  }, [selectedTournamentId]);

  // Aggregate available archetypes within scope
  const archetypes = useMemo(() => {
    return Array.from(new Set(scopedDecks.map(item => item.deck.archetype))).sort();
  }, [scopedDecks]);

  // Search and filter decks
  const filteredDecks = useMemo(() => {
    return scopedDecks
      .filter(({ deck }) => {
        // Search query filter (matches player name, archetype, or card names)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesPlayer = deck.name.toLowerCase().includes(q);
          const matchesArch = deck.archetype.toLowerCase().includes(q);
          const matchesCard =
            deck.mainDeck.some(c => c.name.toLowerCase().includes(q)) ||
            deck.extraDeck.some(c => c.name.toLowerCase().includes(q)) ||
            deck.sideDeck.some(c => c.name.toLowerCase().includes(q));
          if (!matchesPlayer && !matchesArch && !matchesCard) return false;
        }

        // Placement filter
        if (placementFilter === 'champion' && deck.rank !== 1) return false;
        if (placementFilter === 'top4' && deck.rank > 4) return false;
        if (placementFilter === 'top8' && deck.rank > 8) return false;
        if (placementFilter === 'top16' && deck.rank > 16) return false;

        // Archetype filter
        if (archetypeFilter && deck.archetype !== archetypeFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rank-asc') return a.deck.rank - b.deck.rank;
        if (sortBy === 'rank-desc') return b.deck.rank - a.deck.rank;
        if (sortBy === 'name-asc') return a.deck.name.localeCompare(b.deck.name);
        return a.deck.rank - b.deck.rank;
      });
  }, [scopedDecks, searchQuery, placementFilter, archetypeFilter, sortBy]);

  const getPlacementBadge = (rank: number) => {
    if (rank === 1) {
      return {
        text: '🏆 1st Place Champion',
        bg: 'rgba(245, 158, 11, 0.25)',
        border: 'rgba(245, 158, 11, 0.7)',
        color: 'var(--color-gold-light)',
      };
    }
    if (rank === 2) {
      return {
        text: '🥈 2nd Place Finalist',
        bg: 'rgba(203, 213, 225, 0.2)',
        border: 'rgba(203, 213, 225, 0.6)',
        color: '#e2e8f0',
      };
    }
    if (rank <= 4) {
      return {
        text: '🥉 Top 4 Semifinalist',
        bg: 'rgba(56, 189, 248, 0.2)',
        border: 'rgba(56, 189, 248, 0.6)',
        color: 'var(--color-cyan)',
      };
    }
    if (rank <= 8) {
      return {
        text: 'Top 8 Quarterfinalist',
        bg: 'rgba(168, 85, 247, 0.2)',
        border: 'rgba(168, 85, 247, 0.5)',
        color: '#c084fc',
      };
    }
    if (rank <= 16) {
      return {
        text: 'Top 16 Qualifier',
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.4)',
        color: '#34d399',
      };
    }
    return {
      text: `Top Cut (Seed #${rank})`,
      bg: 'rgba(255, 255, 255, 0.08)',
      border: 'var(--border-subtle)',
      color: 'var(--text-muted)',
    };
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 48px 16px', width: '100%', flex: 1 }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          margin: '20px 0 16px 0',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Home
        </Link>
        <span>›</span>
        <Link href="/tournaments" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Tournaments
        </Link>
        <span>›</span>
        <span style={{ color: '#fff', fontWeight: 700 }}>Competitive Decks Showcase</span>
      </div>

      {/* Hero Header */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.725rem',
                  padding: '3px 9px',
                  borderRadius: 12,
                  background: 'rgba(2, 132, 199, 0.2)',
                  color: 'var(--color-cyan)',
                  border: '1px solid rgba(2, 132, 199, 0.4)',
                  fontWeight: 700,
                }}
              >
                OFFICIAL TOURNAMENT DECKLISTS
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.725rem',
                  padding: '3px 9px',
                  borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: 'var(--color-gold-light)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  fontWeight: 700,
                }}
              >
                100-POINT BUDGET CAP VERIFIED
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.25rem',
                margin: '0 0 8px 0',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#fff',
              }}
            >
              Tournament Decks Archive
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: 680 }}>
              Browse top-cut decklists from official Yu-Gi-Oh! Genesys championship events. Click on any deck card or signature monster artwork to inspect the full visual cardboard and 100-point budget breakdown.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/tournaments"
              className="btn btn-secondary"
              style={{
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🏛️ All Tournaments</span>
            </Link>
            <Link
              href="/bracket"
              className="btn btn-secondary"
              style={{
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>⚔️ Playoff Bracket</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Filter and Control Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Tournament Scope Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.775rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
            Tournament:
          </label>
          <select
            value={selectedTournamentId}
            onChange={e => {
              setSelectedTournamentId(e.target.value);
              setArchetypeFilter('');
            }}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              color: '#fff',
              padding: '7px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <option value="all">🌐 All Tournaments ({allDecksWithTournament.length} Decks)</option>
            {allTournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.shortTitle} ({t.totalDecks} Decks)
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div style={{ flex: '1 1 240px', maxWidth: 380, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search player, archetype, or card name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              color: '#fff',
              padding: '8px 12px 8px 34px',
              borderRadius: 6,
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
            }}
          >
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Placement Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Cuts' },
            { id: 'champion', label: '🏆 Champion' },
            { id: 'top4', label: 'Top 4' },
            { id: 'top8', label: 'Top 8' },
            { id: 'top16', label: 'Top 16' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPlacementFilter(p.id)}
              style={{
                background: placementFilter === p.id ? 'var(--color-cyan)' : 'var(--bg-primary)',
                color: placementFilter === p.id ? '#07090e' : 'var(--text-muted)',
                border: `1px solid ${placementFilter === p.id ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Archetype Selector */}
        <select
          value={archetypeFilter}
          onChange={e => setArchetypeFilter(e.target.value)}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-medium)',
            color: '#fff',
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: '0.8rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">All Archetypes ({archetypes.length})</option>
          {archetypes.map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'rank-asc' | 'rank-desc' | 'name-asc')}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-medium)',
            color: '#fff',
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: '0.8rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="rank-asc">Seed / Rank: 1st → Last</option>
          <option value="rank-desc">Seed / Rank: Last → 1st</option>
          <option value="name-asc">Player Name: A → Z</option>
        </select>

        {(searchQuery || placementFilter !== 'all' || archetypeFilter || selectedTournamentId !== 'all') && (
          <button
            onClick={() => {
              setSelectedTournamentId('all');
              setSearchQuery('');
              setPlacementFilter('all');
              setArchetypeFilter('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-red)',
              cursor: 'pointer',
              fontSize: '0.775rem',
              fontWeight: 600,
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Decks Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 16,
        }}
      >
        {filteredDecks.map(({ deck, tournament }) => {
          const placement = getPlacementBadge(deck.rank);
          const topPointCards = [...deck.mainDeck, ...deck.extraDeck, ...deck.sideDeck]
            .filter(c => c.points > 0)
            .sort((a, b) => b.points - a.points)
            .slice(0, 3);

          const targetDeckUrl = `/tournaments/${tournament.id}/decks/${deck.id}`;

          return (
            <div
              key={`${tournament.id}-${deck.id}`}
              className="glass-panel card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 10,
                border: deck.rank === 1 ? '1px solid rgba(245, 158, 11, 0.7)' : '1px solid var(--border-subtle)',
                boxShadow: deck.rank === 1 ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'var(--shadow-sm)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Card Header Section with Signature Thumbnail */}
              <div style={{ display: 'flex', gap: 12, padding: 14, background: 'var(--bg-surface-raised)' }}>
                {/* Clickable Signature Card Thumbnail */}
                <Link
                  href={targetDeckUrl}
                  style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}
                  title={`View ${deck.name}'s ${deck.archetype} Deck`}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#040608',
                      border: '1px solid var(--border-medium)',
                      position: 'relative',
                    }}
                  >
                    {getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl) ? (
                      <img
                        src={getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl)}
                        alt={deck.signatureCard}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : null}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        insetInline: 0,
                        background: 'rgba(0,0,0,0.7)',
                        fontSize: '0.6rem',
                        textAlign: 'center',
                        color: 'var(--color-gold-light)',
                        fontWeight: 800,
                      }}
                    >
                      #{deck.rank}
                    </div>
                  </div>
                </Link>

                {/* Player Name, Archetype & Placement */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span
                      style={{
                        background: placement.bg,
                        border: `1px solid ${placement.border}`,
                        color: placement.color,
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: '0.675rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {placement.text}
                    </span>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        color: deck.pointsSummary.total === 100 ? 'var(--color-gold-light)' : 'var(--color-cyan)',
                      }}
                    >
                      {deck.pointsSummary.total}/100 PTS
                    </span>
                  </div>

                  <Link
                    href={targetDeckUrl}
                    style={{ textDecoration: 'none', color: '#fff' }}
                  >
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {deck.name}
                    </div>
                  </Link>

                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-cyan)',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {deck.archetype}
                  </div>
                </div>
              </div>

              {/* Tournament Identifier Pill */}
              <div
                style={{
                  padding: '4px 14px',
                  background: 'rgba(0,0,0,0.4)',
                  fontSize: '0.675rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span>🏆 {tournament.shortTitle || tournament.title}</span>
                <span>{tournament.year}</span>
              </div>

              {/* Deck Stats & Top Investment Cards */}
              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Card Counts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span>
                    Main: <strong style={{ color: '#fff' }}>{deck.counts.main}</strong>
                  </span>
                  <span>
                    Extra: <strong style={{ color: '#fff' }}>{deck.counts.extra}</strong>
                  </span>
                  <span>
                    Side: <strong style={{ color: '#fff' }}>{deck.counts.side}</strong>
                  </span>
                </div>

                {/* Point Allocation Meter */}
                <div>
                  <div
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <div
                      title={`Main Deck: ${deck.pointsSummary.main} pts`}
                      style={{
                        width: `${(deck.pointsSummary.main / 100) * 100}%`,
                        background: 'var(--color-cyan)',
                      }}
                    />
                    <div
                      title={`Extra Deck: ${deck.pointsSummary.extra} pts`}
                      style={{
                        width: `${(deck.pointsSummary.extra / 100) * 100}%`,
                        background: 'var(--color-gold)',
                      }}
                    />
                    <div
                      title={`Side Deck: ${deck.pointsSummary.side} pts`}
                      style={{
                        width: `${(deck.pointsSummary.side / 100) * 100}%`,
                        background: 'var(--color-green)',
                      }}
                    />
                  </div>
                </div>

                {/* Top Point Cards in this deck */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Key Point Cards:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {topPointCards.map(c => (
                      <span
                        key={c.name}
                        style={{
                          fontSize: '0.675rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span style={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {c.points}p
                        </span>
                        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: View Full Decklist */}
              <div style={{ padding: '0 14px 14px 14px' }}>
                <Link
                  href={targetDeckUrl}
                  className="btn btn-sm btn-secondary"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    width: '100%',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                  }}
                >
                  <span>View Full Deckboard ({deck.counts.main}/{deck.counts.extra}/{deck.counts.side})</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDecks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
          <h3>No tournament decks match your filter</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Try clearing your search query, selecting &ldquo;All Tournaments&rdquo;, or resetting your placement filter.
          </p>
          <button
            onClick={() => {
              setSelectedTournamentId('all');
              setSearchQuery('');
              setPlacementFilter('all');
              setArchetypeFilter('');
            }}
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
