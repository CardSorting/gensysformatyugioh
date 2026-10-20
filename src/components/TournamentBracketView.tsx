'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TournamentData, BracketMatch, BracketPlayer } from '@/types/tournament';
import { getAllTournaments } from '@/lib/tournaments';
import { getDeckThumbnailUrl } from '@/lib/images';

interface TournamentBracketViewProps {
  tournament: TournamentData;
}

export function TournamentBracketView({ tournament }: TournamentBracketViewProps) {
  const router = useRouter();
  const allTournaments = getAllTournaments();
  const [selectedRound, setSelectedRound] = useState<'all' | 'quarterfinals' | 'semifinals' | 'finals'>('all');
  const { finals, semifinals, quarterfinals } = tournament.bracket;
  const hasQuarterfinals = quarterfinals && quarterfinals.length > 0;

  const renderPlayerRow = (player: BracketPlayer, isFinal = false) => {
    return (
      <Link
        href={`/tournaments/${tournament.id}/decks/${player.id}`}
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          background: player.winner ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-primary)',
          borderLeft: player.winner ? '3px solid var(--color-cyan)' : '3px solid transparent',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-surface-hover)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = player.winner ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-primary)';
        }}
        title={`View ${player.name}'s ${player.archetype} Decklist`}
      >
        {/* Interactive Signature Card Thumbnail */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 6,
            overflow: 'hidden',
            background: '#040608',
            border: player.winner ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {getDeckThumbnailUrl(player.signatureCardId, player.thumbnailUrl) ? (
            <img
              src={getDeckThumbnailUrl(player.signatureCardId, player.thumbnailUrl)}
              alt={player.archetype}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              🃏
            </div>
          )}
        </div>

        {/* Player Name and Archetype */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.675rem',
                color: player.winner ? 'var(--color-gold-light)' : 'var(--text-dim)',
                fontWeight: 700,
              }}
            >
              #{player.rank}
            </span>
            <span
              style={{
                fontWeight: player.winner ? 800 : 600,
                fontSize: isFinal ? '0.85rem' : '0.8rem',
                color: player.winner ? '#fff' : 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {player.name}
            </span>
          </div>

          <div style={{ fontSize: '0.675rem', color: player.winner ? 'var(--color-cyan)' : 'var(--text-dim)' }}>
            {player.archetype}
          </div>
        </div>

        {/* Match Result / Trophy indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          {player.winner && isFinal && <span style={{ fontSize: '1rem' }}>🏆</span>}
          <span style={{ fontWeight: 800, color: player.winner ? 'var(--color-cyan)' : 'var(--text-dim)' }}>
            {player.score ?? (player.winner ? 'W' : 'L')}
          </span>
        </div>
      </Link>
    );
  };

  const renderMatchBox = (match: BracketMatch, isFinal = false) => {
    return (
      <div
        key={match.matchId}
        style={{
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--bg-surface-raised)',
          border: isFinal ? '1px solid rgba(245, 158, 11, 0.7)' : '1px solid var(--border-subtle)',
          boxShadow: isFinal ? '0 0 20px rgba(245, 158, 11, 0.2)' : 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 240,
        }}
      >
        <div
          style={{
            padding: '4px 10px',
            background: 'var(--bg-surface-raised)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.675rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
          }}
        >
          <span>{match.round}</span>
          {match.table && <span>Table {match.table}</span>}
        </div>

        {renderPlayerRow(match.player1, isFinal)}
        <div style={{ height: 1, background: 'var(--border-subtle)' }} />
        {renderPlayerRow(match.player2, isFinal)}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 60px 16px', width: '100%', flex: 1 }}>
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
        <Link href={`/tournaments/${tournament.id}`} style={{ color: 'var(--color-cyan)', textDecoration: 'none', fontWeight: 600 }}>
          {tournament.shortTitle || tournament.title}
        </Link>
        <span>›</span>
        <span style={{ color: '#fff', fontWeight: 700 }}>Playoff Bracket</span>
      </div>

      {/* Header with Tournament Switcher */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 20,
          marginBottom: 20,
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
                SINGLE ELIMINATION PLAYOFFS
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
                {tournament.shortTitle || tournament.title}
              </span>
            </div>

            <h1
              style={{
                fontSize: '2rem',
                margin: '0 0 6px 0',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#fff',
              }}
            >
              Tournament Elimination Bracket
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, maxWidth: 640 }}>
              Track the path to the championship title. Click on any player row or card thumbnail to view their full 100-point decklist.
            </p>
          </div>

          {/* Tournament Switcher Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Switch Event:
            </label>
            <select
              value={tournament.id}
              onChange={e => {
                const targetId = e.target.value;
                router.push(`/tournaments/${targetId}/bracket`);
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
              }}
            >
              {allTournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.shortTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Link
            href={`/tournaments/${tournament.id}`}
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--bg-surface-raised)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            📋 All Decks ({tournament.decks.length})
          </Link>

          <Link
            href={`/tournaments/${tournament.id}/bracket`}
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--bg-surface-raised)',
              color: 'var(--color-cyan)',
              border: '1px solid var(--color-cyan)',
            }}
          >
            ⚔️ Playoff Bracket
          </Link>
        </div>
      </section>

      {/* Champion Spotlight Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: 24,
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(7, 9, 14, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.6)',
          boxShadow: '0 0 28px rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link
            href={`/tournaments/${tournament.id}/decks/${tournament.champion.deckId}`}
            style={{ textDecoration: 'none' }}
            title={`View Champion ${tournament.champion.name}'s Decklist`}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#040608',
                border: '2px solid var(--color-gold)',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
                cursor: 'pointer',
              }}
            >
              {getDeckThumbnailUrl(tournament.champion.signatureCardId, tournament.champion.thumbnailUrl) ? (
                <img
                  src={getDeckThumbnailUrl(tournament.champion.signatureCardId, tournament.champion.thumbnailUrl)}
                  alt={tournament.champion.archetype}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                  🏆
                </div>
              )}
            </div>
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.25rem' }}>🏆</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--color-gold-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Tournament Champion
              </span>
            </div>

            <h2
              style={{
                margin: '0 0 4px 0',
                color: '#fff',
                fontSize: '1.7rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
              }}
            >
              {tournament.champion.name}
            </h2>

            <div style={{ fontSize: '1rem', color: 'var(--color-cyan)', fontWeight: 700 }}>
              {tournament.champion.archetype}
            </div>
          </div>
        </div>

        <Link
          href={`/tournaments/${tournament.id}/decks/${tournament.champion.deckId}`}
          className="btn btn-primary"
          style={{
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '10px 20px',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
          }}
        >
          View Champion Decklist (100 PTS) →
        </Link>
      </div>

      {/* Round Selection Tabs for Mobile & Desktop Ergonomics */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {[
          { id: 'all' as const, label: '⚔️ Full Bracket Tree' },
          ...(hasQuarterfinals ? [{ id: 'quarterfinals' as const, label: 'Top 8 (Quarterfinals)' }] : []),
          { id: 'semifinals' as const, label: 'Top 4 (Semifinals)' },
          { id: 'finals' as const, label: '🏆 Championship Finals' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedRound(r.id)}
            style={{
              background: selectedRound === r.id ? 'var(--color-cyan)' : 'var(--bg-surface-raised)',
              color: selectedRound === r.id ? '#07090e' : 'var(--text-muted)',
              border: `1px solid ${selectedRound === r.id ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Interactive Bracket Grid */}
      <div
        className="glass-panel"
        style={{
          padding: 24,
          overflowX: 'auto',
          minHeight: 460,
        }}
      >
        {selectedRound === 'all' ? (
          <div
            style={{
              display: 'flex',
              gap: 36,
              minWidth: hasQuarterfinals ? 880 : 580,
              alignItems: 'stretch',
            }}
          >
            {/* Round 1: Quarterfinals (if applicable) */}
            {hasQuarterfinals && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    paddingBottom: 10,
                    marginBottom: 16,
                    borderBottom: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                  }}
                >
                  Quarterfinals (Top 8)
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    flex: 1,
                    gap: 20,
                  }}
                >
                  {quarterfinals.map(match => renderMatchBox(match, false))}
                </div>
              </div>
            )}

            {/* Round 2: Semifinals */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  paddingBottom: 10,
                  marginBottom: 16,
                  borderBottom: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                Semifinals (Top 4)
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  flex: 1,
                  gap: 24,
                }}
              >
                {semifinals.map(match => renderMatchBox(match, false))}
              </div>
            </div>

            {/* Round 3: Championship Finals */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--color-gold-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  paddingBottom: 10,
                  marginBottom: 16,
                  borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
                  textAlign: 'center',
                }}
              >
                🏆 Championship Finals
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                {renderMatchBox(finals, true)}
              </div>
            </div>
          </div>
        ) : (
          /* Focused Round Mode (Ergonomic on Mobile) */
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: selectedRound === 'finals' ? 'var(--color-gold-light)' : 'var(--color-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: 'center',
                paddingBottom: 8,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {selectedRound === 'quarterfinals' && 'Top 8 Quarterfinal Matches'}
              {selectedRound === 'semifinals' && 'Top 4 Semifinal Matches'}
              {selectedRound === 'finals' && '🏆 Official Championship Final'}
            </div>

            {selectedRound === 'quarterfinals' && quarterfinals && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {quarterfinals.map(match => renderMatchBox(match, false))}
              </div>
            )}

            {selectedRound === 'semifinals' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {semifinals.map(match => renderMatchBox(match, false))}
              </div>
            )}

            {selectedRound === 'finals' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {renderMatchBox(finals, true)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
