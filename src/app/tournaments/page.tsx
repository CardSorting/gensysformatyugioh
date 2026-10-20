'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllTournaments } from '@/lib/tournaments';
import { getDeckThumbnailUrl } from '@/lib/images';

const allTournaments = getAllTournaments();

export default function TournamentsHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const filteredTournaments = useMemo(() => {
    return allTournaments.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesCity = t.city.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
        const matchesChamp = t.champion.name.toLowerCase().includes(q) || t.champion.archetype.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCity && !matchesChamp) return false;
      }

      if (tierFilter !== 'all' && !t.tier.toLowerCase().includes(tierFilter.toLowerCase())) {
        return false;
      }

      if (yearFilter !== 'all' && String(t.year) !== yearFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, tierFilter, yearFilter]);

  const getTierBadge = (tier: string) => {
    if (tier.includes('Premier') || tier.includes('YCS')) {
      return {
        bg: 'rgba(245, 158, 11, 0.2)',
        border: 'rgba(245, 158, 11, 0.6)',
        color: 'var(--color-gold-light)',
      };
    }
    if (tier.includes('Playoff') || tier.includes('Championship')) {
      return {
        bg: 'rgba(2, 132, 199, 0.2)',
        border: 'rgba(2, 132, 199, 0.6)',
        color: 'var(--color-cyan)',
      };
    }
    return {
      bg: 'rgba(255, 255, 255, 0.08)',
      border: 'var(--border-subtle)',
      color: 'var(--text-muted)',
    };
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 60px 16px', width: '100%', flex: 1 }}>
      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.08) 0%, rgba(7, 9, 14, 0) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '32px 0 24px 0',
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
                COMPETITIVE ARCHIVE &amp; REGISTRY
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
                OFFICIAL KONAMI GENESYS FORMAT
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
                color: '#fff',
                margin: '0 0 8px 0',
                fontWeight: 900,
              }}
            >
              GENESYS TOURNAMENT ARCHIVE &amp; RESULTS
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 840, lineHeight: 1.5, margin: 0 }}>
              Comprehensive historical directory of Yu-Gi-Oh! Genesys competitive tournaments. Browse top-cut decklists, inspect elimination playoff brackets, and review evolving format metagame shifts across premier YCS and championship events.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              href="/decks"
              className="btn btn-primary"
              style={{ textDecoration: 'none', fontSize: '0.825rem' }}
            >
              Browse All Decks →
            </Link>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          position: 'sticky',
          top: 10,
          zIndex: 30,
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search tournaments by event name, city, champion, or archetype..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 8,
              padding: '8px 12px 8px 34px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
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
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Tier filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Events (${allTournaments.length})` },
            { id: 'ycs', label: 'YCS Premier Events' },
            { id: 'playoff', label: 'Championship Playoffs' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTierFilter(f.id)}
              style={{
                background: tierFilter === f.id ? 'var(--color-cyan)' : 'var(--bg-primary)',
                color: tierFilter === f.id ? '#07090e' : 'var(--text-main)',
                border: `1px solid ${tierFilter === f.id ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.775rem',
                fontWeight: tierFilter === f.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Year filter */}
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
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
          <option value="all">All Years</option>
          <option value="2026">2026</option>
        </select>
      </div>

      {/* Tournament Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: 20,
        }}
      >
        {filteredTournaments.map(tournament => {
          const tierBadge = getTierBadge(tournament.tier);

          return (
            <div
              key={tournament.id}
              className="glass-panel"
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: tournament.id.includes('ycs') ? '2px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-medium)',
                boxShadow: tournament.id.includes('ycs') ? '0 0 20px rgba(245, 158, 11, 0.2)' : 'var(--shadow-sm)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = tournament.id.includes('ycs') ? '0 0 20px rgba(245, 158, 11, 0.2)' : 'var(--shadow-sm)';
              }}
            >
              {/* Event Header */}
              <div style={{ padding: 18, background: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span
                    style={{
                      background: tierBadge.bg,
                      border: `1px solid ${tierBadge.border}`,
                      color: tierBadge.color,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {tournament.tier}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {tournament.date}
                  </span>
                </div>

                <Link
                  href={`/tournaments/${tournament.id}`}
                  style={{
                    textDecoration: 'none',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    color: '#fff',
                    fontWeight: 800,
                    lineHeight: 1.25,
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {tournament.title}
                </Link>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  📍 {tournament.location} • Format: <strong style={{ color: 'var(--color-cyan)' }}>Genesys 100-pt Budget</strong>
                </div>
              </div>

              {/* Event Body: Champion & Metagame snapshot */}
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Champion Card */}
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Link href={`/tournaments/${tournament.id}/decks/${tournament.champion.deckId}`}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#040608',
                        border: '1px solid var(--color-gold-light)',
                        flexShrink: 0,
                      }}
                    >
                      {getDeckThumbnailUrl(tournament.champion.signatureCardId, tournament.champion.thumbnailUrl) ? (
                        <img
                          src={getDeckThumbnailUrl(tournament.champion.signatureCardId, tournament.champion.thumbnailUrl)}
                          alt={tournament.champion.archetype}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : null}
                    </div>
                  </Link>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.675rem', color: 'var(--color-gold-light)', fontWeight: 800, textTransform: 'uppercase' }}>
                      EVENT CHAMPION 🏆
                    </div>
                    <Link
                      href={`/tournaments/${tournament.id}/decks/${tournament.champion.deckId}`}
                      style={{
                        textDecoration: 'none',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {tournament.champion.name}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-cyan)' }}>
                      {tournament.champion.archetype} Deck
                    </div>
                  </div>
                </div>

                {/* Top Archetype Pills */}
                {tournament.topArchetypes.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                      TOP ARCHETYPES:
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {tournament.topArchetypes.map((a, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-subtle)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.725rem',
                            color: 'var(--text-main)',
                          }}
                        >
                          <strong>{a.archetype}</strong> ({a.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Event Actions Footer */}
              <div
                style={{
                  padding: '12px 18px',
                  background: 'var(--bg-primary)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Link
                  href={`/tournaments/${tournament.id}/bracket`}
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', fontSize: '0.75rem' }}
                >
                  ⚔️ Bracket
                </Link>

                <Link
                  href={`/tournaments/${tournament.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none', fontSize: '0.75rem' }}
                >
                  View {tournament.totalDecks} Decks →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
