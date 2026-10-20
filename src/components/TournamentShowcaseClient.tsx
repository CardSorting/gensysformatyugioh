'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTournamentById, getAllTournaments, getDefaultTournament } from '@/lib/tournaments';
import { getDeckThumbnailUrl } from '@/lib/images';
import { TournamentMetagameView } from '@/components/TournamentMetagameView';
import { CardDetailModal } from '@/components/CardDetailModal';
import { getKnownCard } from '@/lib/card-lookup';
import { Card } from '@/types/card';

export default function TournamentShowcaseClient({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const router = useRouter();

  const tournament = getTournamentById(tournamentId) || getDefaultTournament();
  const allTournaments = getAllTournaments();
  const decks = tournament.decks;

  const [searchQuery, setSearchQuery] = useState('');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [archetypeFilter, setArchetypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'rank-asc' | 'rank-desc' | 'name-asc'>('rank-asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [inspectCard, setInspectCard] = useState<Card | null>(null);

  const handleInspectCard = (cardId: number, cardName: string, points = 0) => {
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

  const filteredDecks = decks
    .filter(deck => {
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

      if (placementFilter === 'champion' && deck.rank !== 1) return false;
      if (placementFilter === 'top4' && deck.rank > 4) return false;
      if (placementFilter === 'top8' && deck.rank > 8) return false;
      if (placementFilter === 'top16' && deck.rank > 16) return false;

      if (archetypeFilter && deck.archetype !== archetypeFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rank-asc') return a.rank - b.rank;
      if (sortBy === 'rank-desc') return b.rank - a.rank;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return a.rank - b.rank;
    });

  const getPlacementBadge = (rank: number) => {
    if (rank === 1) {
      return {
        text: '🏆 Champion (1st)',
        bg: 'rgba(245, 158, 11, 0.25)',
        border: 'rgba(245, 158, 11, 0.7)',
        color: 'var(--color-gold-light)',
      };
    }
    if (rank === 2) {
      return {
        text: '🥈 Finalist (2nd)',
        bg: 'rgba(203, 213, 225, 0.2)',
        border: 'rgba(203, 213, 225, 0.6)',
        color: '#e2e8f0',
      };
    }
    if (rank <= 4) {
      return {
        text: '🥉 Top 4',
        bg: 'rgba(56, 189, 248, 0.2)',
        border: 'rgba(56, 189, 248, 0.6)',
        color: 'var(--color-cyan)',
      };
    }
    if (rank <= 8) {
      return {
        text: 'Top 8',
        bg: 'rgba(168, 85, 247, 0.2)',
        border: 'rgba(168, 85, 247, 0.5)',
        color: '#c084fc',
      };
    }
    if (rank <= 16) {
      return {
        text: 'Top 16',
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.4)',
        color: '#34d399',
      };
    }
    return {
      text: `Top 32 (#${rank})`,
      bg: 'rgba(255, 255, 255, 0.08)',
      border: 'var(--border-subtle)',
      color: 'var(--text-muted)',
    };
  };

  const hasActiveFilters = Boolean(archetypeFilter || placementFilter !== 'all' || searchQuery);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 60px 16px', width: '100%', flex: 1 }}>
      {/* 1. BROADCAST-GRADE TOURNAMENT HEADER (CLEAN & ZERO FLUFF) */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(7, 9, 14, 0) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 0 14px 0',
          marginBottom: 16,
        }}
      >
        {/* Top Utility Row: Breadcrumb & Event Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
            <Link href="/tournaments" style={{ color: 'var(--color-cyan)', textDecoration: 'none', fontWeight: 700 }}>
              ← Tournaments
            </Link>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ color: '#fff', fontWeight: 800 }}>{tournament.title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>SWITCH:</span>
              <select
                value={tournament.id}
                onChange={e => router.push(`/tournaments/${e.target.value}`)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {allTournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.shortTitle || t.title}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href={`/tournaments/${tournament.id}/bracket`}
              className="btn btn-primary btn-sm"
              style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '4px 10px' }}
            >
              ⚔️ Playoff Bracket →
            </Link>
            <a
              href={tournament.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Konami Blog ↗
            </a>
          </div>
        </div>

        {/* Hero Title & Fast Stats Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: '#fff',
                margin: 0,
                fontWeight: 900,
                letterSpacing: '-0.3px',
              }}
            >
              {tournament.title.toUpperCase()}
            </h1>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.675rem',
                padding: '2px 8px',
                borderRadius: 5,
                background: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--color-gold-light)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontWeight: 800,
              }}
            >
              {tournament.tier || 'KONAMI PREMIER EVENT'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.675rem',
                padding: '2px 8px',
                borderRadius: 5,
                background: 'rgba(2, 132, 199, 0.15)',
                color: 'var(--color-cyan)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                fontWeight: 700,
              }}
            >
              {tournament.date} • {tournament.location}
            </span>
          </div>

          {/* Quick Champion Callout Pill */}
          {decks[0] && (
            <Link
              href={`/tournaments/${tournament.id}/decks/${decks[0].id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              title="Inspect Champion Decklist"
            >
              <span style={{ fontSize: '1rem' }}>🏆</span>
              <div>
                <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)', textTransform: 'uppercase', fontWeight: 800 }}>
                  Event Champion
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                  {decks[0].name} ({decks[0].archetype})
                </div>
              </div>
              <span style={{ color: 'var(--color-gold-light)', fontSize: '0.75rem', marginLeft: 4 }}>→</span>
            </Link>
          )}
        </div>
      </section>

      {/* 2. INTERACTIVE METAGAME ANALYTICS (COMPACT COMMAND HUB) */}
      <TournamentMetagameView
        tournament={tournament}
        activeArchetype={archetypeFilter}
        onSelectArchetype={setArchetypeFilter}
      />

      {/* 3. UNIFIED SLIM STICKY CONTROL HUD */}
      <div
        className="glass-panel"
        style={{
          padding: '10px 14px',
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          position: 'sticky',
          top: 10,
          zIndex: 30,
        }}
      >
        {/* Live Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search player, archetype, card..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 6,
              padding: '6px 10px 6px 28px',
              color: '#fff',
              fontSize: '0.775rem',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Placement Quick Pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${decks.length})` },
            { id: 'champion', label: '🏆 Champ' },
            { id: 'top4', label: 'Top 4' },
            { id: 'top8', label: 'Top 8' },
            { id: 'top16', label: 'Top 16' },
          ].map(p => {
            const isSelected = placementFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlacementFilter(p.id)}
                style={{
                  background: isSelected ? 'var(--color-cyan)' : 'var(--bg-primary)',
                  color: isSelected ? '#07090e' : 'var(--text-main)',
                  border: `1px solid ${isSelected ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                  padding: '4px 8px',
                  borderRadius: 5,
                  fontSize: '0.725rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Active Archetype Tag Pill */}
        {archetypeFilter && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 5,
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid var(--color-cyan)',
              color: 'var(--color-cyan)',
              fontWeight: 800,
              fontSize: '0.725rem',
            }}
          >
            <span>⚡ {archetypeFilter}</span>
            <button
              onClick={() => setArchetypeFilter('')}
              style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', padding: 0, fontWeight: 900 }}
              title="Clear Archetype Filter"
            >
              ✕
            </button>
          </span>
        )}

        {/* Global Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery('');
              setPlacementFilter('all');
              setArchetypeFilter('');
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '3px 8px',
              borderRadius: 5,
              fontSize: '0.725rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Reset search and filters"
          >
            Reset ✕
          </button>
        )}

        {/* View Mode Toggle Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)', marginLeft: 'auto' }}>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              background: viewMode === 'cards' ? 'var(--bg-surface-raised)' : 'transparent',
              border: 'none',
              color: viewMode === 'cards' ? 'var(--color-cyan)' : 'var(--text-muted)',
              padding: '3px 7px',
              borderRadius: 4,
              fontSize: '0.725rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Card showcase grid"
          >
            <span>🎴</span>
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? 'var(--bg-surface-raised)' : 'transparent',
              border: 'none',
              color: viewMode === 'table' ? 'var(--color-cyan)' : 'var(--text-muted)',
              padding: '3px 7px',
              borderRadius: 4,
              fontSize: '0.725rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Tournament roster table"
          >
            <span>📋</span>
            <span>Table</span>
          </button>
        </div>

        {/* Sort Selector */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'rank-asc' | 'rank-desc' | 'name-asc')}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-medium)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 5,
            fontSize: '0.725rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="rank-asc">Seed: 1st → {decks.length}th</option>
          <option value="rank-desc">Seed: {decks.length}th → 1st</option>
          <option value="name-asc">Player: A → Z</option>
        </select>

        {/* Counter */}
        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
          <strong>{filteredDecks.length}</strong>/{decks.length}
        </span>
      </div>

      {/* 4A. VIEW MODE: CARDS GRID (WORLD-CLASS HIGH-IMPACT DESIGN) */}
      {viewMode === 'cards' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 14,
          }}
        >
          {filteredDecks.map(deck => {
            const placement = getPlacementBadge(deck.rank);
            const topPointCards = [...deck.mainDeck, ...deck.extraDeck, ...deck.sideDeck]
              .filter(c => c.points > 0)
              .sort((a, b) => b.points - a.points)
              .slice(0, 3);

            return (
              <div
                key={deck.id}
                className="glass-panel"
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: deck.rank === 1 ? '2px solid rgba(245, 158, 11, 0.7)' : '1px solid var(--border-subtle)',
                  boxShadow: deck.rank === 1 ? '0 0 16px rgba(245, 158, 11, 0.25)' : 'var(--shadow-sm)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--color-cyan)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = deck.rank === 1 ? 'rgba(245, 158, 11, 0.7)' : 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = deck.rank === 1 ? '0 0 16px rgba(245, 158, 11, 0.25)' : 'var(--shadow-sm)';
                }}
              >
                {/* Header: 54px Artwork Thumbnail + Player + Strategy */}
                <div style={{ display: 'flex', gap: 10, padding: 12, background: 'var(--bg-surface-raised)' }}>
                  <Link
                    href={`/tournaments/${tournament.id}/decks/${deck.id}`}
                    style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}
                    title={`Inspect ${deck.name}'s ${deck.archetype}`}
                  >
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 7,
                        overflow: 'hidden',
                        background: '#040608',
                        border: '1px solid var(--border-medium)',
                        position: 'relative',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      {getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl) ? (
                        <img
                          src={getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl)}
                          alt={deck.signatureCard}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎴</div>
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          insetInline: 0,
                          background: 'rgba(0,0,0,0.8)',
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

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span
                        style={{
                          background: placement.bg,
                          border: `1px solid ${placement.border}`,
                          color: placement.color,
                          padding: '1px 5px',
                          borderRadius: 3,
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {placement.text}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          fontFamily: 'var(--font-mono)',
                          color: deck.pointsSummary.total === 100 ? 'var(--color-gold-light)' : 'var(--color-cyan)',
                        }}
                      >
                        {deck.pointsSummary.total}/100 PTS
                      </span>
                    </div>

                    <Link
                      href={`/tournaments/${tournament.id}/decks/${deck.id}`}
                      style={{
                        textDecoration: 'none',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        color: '#fff',
                        lineHeight: 1.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={deck.name}
                    >
                      {deck.name}
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setArchetypeFilter(archetypeFilter === deck.archetype ? '' : deck.archetype);
                      }}
                      style={{
                        background: archetypeFilter === deck.archetype ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        border: `1px solid ${archetypeFilter === deck.archetype ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                        borderRadius: 4,
                        padding: '1px 5px',
                        fontSize: '0.675rem',
                        color: archetypeFilter === deck.archetype ? 'var(--color-cyan)' : 'var(--text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: 'fit-content',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Filter by ${deck.archetype}`}
                    >
                      ⚡ {deck.archetype}
                    </button>
                  </div>
                </div>

                {/* Body: Tri-Color Budget Meter & Top Point Cards */}
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Segmented Budget Meter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 3 }}>
                      <span style={{ color: 'var(--color-cyan)' }}>Main {deck.pointsSummary.main}p</span>
                      <span style={{ color: '#c084fc' }}>Extra {deck.pointsSummary.extra}p</span>
                      <span style={{ color: '#f59e0b' }}>Side {deck.pointsSummary.side}p</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${deck.pointsSummary.main}%`, background: 'var(--color-cyan)' }} />
                      <div style={{ width: `${deck.pointsSummary.extra}%`, background: '#c084fc' }} />
                      <div style={{ width: `${deck.pointsSummary.side}%`, background: '#f59e0b' }} />
                    </div>
                  </div>

                  {/* Top Point Investments (Click to Inspect) */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {topPointCards.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleInspectCard(0, c.name, c.points)}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 4,
                          padding: '2px 5px',
                          fontSize: '0.65rem',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title={`Inspect ${c.name} (${c.points} pts)`}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--color-cyan)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-medium)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span style={{ color: 'var(--color-gold-light)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          {c.points}p
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 95 }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>🔍</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer: Card Ratios & Deck Action */}
                <div
                  style={{
                    padding: '6px 12px',
                    background: 'var(--bg-primary)',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {deck.counts.main}M • {deck.counts.extra}E • {deck.counts.side}S
                  </span>

                  <Link
                    href={`/tournaments/${tournament.id}/decks/${deck.id}`}
                    style={{ textDecoration: 'none', fontSize: '0.725rem', color: 'var(--color-cyan)', fontWeight: 700 }}
                  >
                    Inspect 70 Cards →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4B. VIEW MODE: TOURNAMENT ROSTER TABLE (COMPACT HIGH-DENSITY SCANNING) */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.775rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', fontSize: '0.675rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                <th style={{ padding: '8px 12px' }}>Seed</th>
                <th style={{ padding: '8px 12px' }}>Placement</th>
                <th style={{ padding: '8px 12px' }}>Player</th>
                <th style={{ padding: '8px 12px' }}>Strategy</th>
                <th style={{ padding: '8px 12px' }}>Budget Split (100 PTS)</th>
                <th style={{ padding: '8px 12px' }}>Top Point Investments</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDecks.map(deck => {
                const placement = getPlacementBadge(deck.rank);
                const topPointCards = [...deck.mainDeck, ...deck.extraDeck, ...deck.sideDeck]
                  .filter(c => c.points > 0)
                  .sort((a, b) => b.points - a.points)
                  .slice(0, 3);

                return (
                  <tr
                    key={deck.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                    className="hover-card"
                  >
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-gold-light)' }}>
                      #{deck.rank}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span
                        style={{
                          background: placement.bg,
                          border: `1px solid ${placement.border}`,
                          color: placement.color,
                          padding: '1px 5px',
                          borderRadius: 3,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {placement.text}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <Link
                        href={`/tournaments/${tournament.id}/decks/${deck.id}`}
                        style={{ color: '#fff', textDecoration: 'none', fontWeight: 800 }}
                      >
                        {deck.name}
                      </Link>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        onClick={() => setArchetypeFilter(archetypeFilter === deck.archetype ? '' : deck.archetype)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: archetypeFilter === deck.archetype ? 'var(--color-cyan)' : 'var(--text-muted)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                        }}
                      >
                        ⚡ {deck.archetype}
                      </button>
                    </td>
                    <td style={{ padding: '8px 12px', minWidth: 150 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: `${deck.pointsSummary.main}%`, background: 'var(--color-cyan)' }} />
                          <div style={{ width: `${deck.pointsSummary.extra}%`, background: '#c084fc' }} />
                          <div style={{ width: `${deck.pointsSummary.side}%`, background: '#f59e0b' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800, color: deck.pointsSummary.total === 100 ? 'var(--color-gold-light)' : 'var(--color-cyan)' }}>
                          {deck.pointsSummary.total}p
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {topPointCards.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => handleInspectCard(0, c.name, c.points)}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 3,
                              padding: '1px 5px',
                              fontSize: '0.625rem',
                              color: '#fff',
                              cursor: 'pointer',
                            }}
                            title={`Inspect ${c.name} (${c.points}p)`}
                          >
                            <span style={{ color: 'var(--color-gold-light)', fontWeight: 800 }}>{c.points}p</span> {c.name}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <Link
                        href={`/tournaments/${tournament.id}/decks/${deck.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none', fontSize: '0.675rem', padding: '2px 7px' }}
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Card Detail Modal (Universal Card Inspector) */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => setInspectCard(null)}
          deckSection="Tournament Qualified Decks"
        />
      )}
    </div>
  );
}
