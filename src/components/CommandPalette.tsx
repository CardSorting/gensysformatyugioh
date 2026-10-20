'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import cardsRaw from '@/data/cards.json';
import { Card } from '@/types/card';
import { getAllTournaments, getAllDecksAcrossAllTournaments } from '@/lib/tournaments';
import { getProxiedImageUrl, getDeckThumbnailUrl } from '@/lib/images';

const allCards: Card[] = cardsRaw as Card[];
const allTournaments = getAllTournaments();
const allDecksWithTournament = getAllDecksAcrossAllTournaments();

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Compute search results across Cards, Decks, and Tournaments
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: show featured top decks and highest point cards
      const topDecks = allDecksWithTournament.slice(0, 4).map(({ deck, tournament }) => ({
        type: 'deck' as const,
        id: `deck-${deck.id}`,
        title: `${deck.name} (${deck.archetype})`,
        subtitle: `${tournament.shortTitle} • #${deck.rank} • ${deck.pointsSummary.total} pts`,
        url: `/tournaments/${tournament.id}/decks/${deck.id}`,
        badge: `#${deck.rank} Seed`,
        thumbnail: getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl),
      }));

      const topCards = allCards
        .filter(c => (c.points || 0) >= 80)
        .slice(0, 4)
        .map(c => ({
          type: 'card' as const,
          id: `card-${c.id}`,
          title: c.name,
          subtitle: `${c.type} • ${c.points || 0} Genesys Points`,
          url: `/card/${c.id}`,
          badge: `${c.points} PTS`,
          thumbnail: getProxiedImageUrl(c.id, 'cropped', c.images?.[0]?.image_url_cropped),
        }));

      return [...topDecks, ...topCards];
    }

    const matchedCards = allCards
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.archetype && c.archetype.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map(c => ({
        type: 'card' as const,
        id: `card-${c.id}`,
        title: c.name,
        subtitle: `${c.type} • ${c.points || 0} pts`,
        url: `/card/${c.id}`,
        badge: `${c.points || 0} PTS`,
        thumbnail: getProxiedImageUrl(c.id, 'cropped', c.images?.[0]?.image_url_cropped),
      }));

    const matchedDecks = allDecksWithTournament
      .filter(({ deck }) =>
        deck.name.toLowerCase().includes(q) ||
        deck.archetype.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(({ deck, tournament }) => ({
        type: 'deck' as const,
        id: `deck-${tournament.id}-${deck.id}`,
        title: `${deck.name} • ${deck.archetype}`,
        subtitle: `${tournament.shortTitle} • Rank #${deck.rank} • ${deck.pointsSummary.total}/100 pts`,
        url: `/tournaments/${tournament.id}/decks/${deck.id}`,
        badge: `Rank #${deck.rank}`,
        thumbnail: getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl),
      }));

    const appPages = [
      { id: 'page-home', title: 'Welcome & Format Introduction', subtitle: 'Format guide, 100-pt budget interactive sandbox, rules & origins', url: '/', badge: '✨ Welcome', keywords: ['home', 'welcome', 'guide', 'start', 'intro', 'overview', 'rules', 'genesys'] },
      { id: 'page-cards', title: 'Point List Visualizer & Card Gallery', subtitle: 'Browse official point-bearing cards and 0-pt pool with live filters', url: '/cards', badge: '🃏 Point List', keywords: ['point', 'points', 'cards', 'gallery', 'list', 'visualizer', 'cost'] },
      { id: 'page-tournaments', title: 'Tournaments Overview & Metagame', subtitle: 'YCS Houston 2026, premier events, and archetype share', url: '/tournaments', badge: '🏛️ Tournaments', keywords: ['tournament', 'tournaments', 'ycs', 'houston', 'meta', 'metagame'] },
      { id: 'page-decks', title: 'Top 32 Decks Archive', subtitle: 'All tournament decklists with Main, Extra, Side, and point tallies', url: '/decks', badge: '🏆 Decks', keywords: ['decks', 'deck', 'top 32', 'archive', 'lists'] },
      { id: 'page-bracket', title: 'Playoff Elimination Bracket', subtitle: 'Interactive Top 32 championship elimination tree', url: '/bracket', badge: '⚔️ Bracket', keywords: ['bracket', 'playoffs', 'tree', 'finals', 'elimination'] },
    ];

    const matchedPages = appPages
      .filter(p => p.title.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q)))
      .map(p => ({
        type: 'deck' as const, // reuse badge display styling
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        url: p.url,
        badge: p.badge,
        thumbnail: '',
      }));

    const matchedTournaments = allTournaments
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map(t => ({
        type: 'tournament' as const,
        id: `tourney-${t.id}`,
        title: t.title,
        subtitle: `${t.location} • ${t.date} • ${t.totalDecks} Top Cut Decks`,
        url: `/tournaments/${t.id}`,
        badge: t.tier,
        thumbnail: getDeckThumbnailUrl(t.champion.signatureCardId, t.champion.thumbnailUrl),
      }));

    return [...matchedPages, ...matchedDecks, ...matchedCards, ...matchedTournaments];
  }, [query]);

  // Navigate to selected result
  const handleSelect = useCallback((url: string) => {
    onClose();
    router.push(url);
  }, [onClose, router]);

  // Keyboard navigation within command palette
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex].url);
      }
    }
  }, [onClose, searchResults, selectedIndex, handleSelect]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Universal Command Search"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(7, 9, 14, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 16px 20px 16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel-raised"
        style={{
          width: '100%',
          maxWidth: 620,
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 20, 30, 0.95)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: 12,
            background: 'var(--bg-primary)',
          }}
        >
          <span style={{ fontSize: '1.2rem', color: 'var(--color-cyan)', lineHeight: 1 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search cards, tournament decks, players, or archetypes..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '2px 6px',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
          <kbd
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: 380,
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {searchResults.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>🃏</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>No results found for &ldquo;{query}&rdquo;</div>
              <div style={{ fontSize: '0.775rem', marginTop: 4 }}>Try searching for a card name (e.g. &ldquo;Ash Blossom&rdquo;), archetype (&ldquo;Blitzclique&rdquo;), or player.</div>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                    border: isSelected ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#040608',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.9rem' }}>
                          {item.type === 'deck' ? '🏆' : item.type === 'card' ? '🃏' : '🏛️'}
                        </span>
                      )}
                    </div>

                    {/* Titles */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--color-cyan)' : '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.725rem',
                          color: 'var(--text-dim)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: item.type === 'card' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: item.type === 'card' ? 'var(--color-cyan)' : 'var(--color-gold-light)',
                        border: `1px solid ${item.type === 'card' ? 'rgba(2, 132, 199, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                    <span style={{ color: isSelected ? 'var(--color-cyan)' : 'var(--text-dim)', fontSize: '0.8rem' }}>
                      ↵
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
            fontSize: '0.725rem',
            color: 'var(--text-dim)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>↑</kbd> <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>↓</kbd> to navigate</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>↵</kbd> to open</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>esc</kbd> to dismiss</span>
          </div>
          <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Genesys Fast Search</span>
        </div>
      </div>
    </div>
  );
}
