'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TournamentData,
  TournamentDeck,
  DeckCardItem,
} from '@/types/tournament';
import {
  getAllTournaments,
  getTournamentById,
  getAdjacentDecks,
  generateYdkContent,
  generateTextDecklist,
} from '@/lib/tournaments';
import { CardDetailModal } from '@/components/CardDetailModal';
import { Card } from '@/types/card';
import { getKnownCard } from '@/lib/card-lookup';
import { getProxiedImageUrl, getDeckThumbnailUrl } from '@/lib/images';

interface TournamentDeckViewProps {
  tournament: TournamentData;
  deck: TournamentDeck;
  canonicalPath?: string;
}

export function TournamentDeckView({
  tournament,
  deck,
}: TournamentDeckViewProps) {
  const router = useRouter();
  const allTournaments = getAllTournaments();
  const { prevDeck, nextDeck } = getAdjacentDecks(tournament.id, deck.id);

  const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual');
  const [filterQuery, setFilterQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'monsters' | 'spells' | 'traps' | 'extra' | 'side'>('all');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const [inspectList, setInspectList] = useState<DeckCardItem[]>([]);
  const [inspectIndex, setInspectIndex] = useState<number>(-1);
  const [inspectSection, setInspectSection] = useState<string>('');

  // Group Main Deck into Monsters, Spells, Traps
  const monsters = useMemo(() => deck.mainDeck.filter(c => c.category === 'monster'), [deck]);
  const spells = useMemo(() => deck.mainDeck.filter(c => c.category === 'spell'), [deck]);
  const traps = useMemo(() => deck.mainDeck.filter(c => c.category === 'trap'), [deck]);

  // Breakdown of Extra Deck mechanics
  const fusions = useMemo(() => deck.extraDeck.filter(c => c.type.toLowerCase().includes('fusion')), [deck]);
  const synchros = useMemo(() => deck.extraDeck.filter(c => c.type.toLowerCase().includes('synchro')), [deck]);
  const xyzs = useMemo(() => deck.extraDeck.filter(c => c.type.toLowerCase().includes('xyz')), [deck]);

  // High point investments (cards with point cost >= 15)
  const highPointCards = useMemo(() => {
    const all = [...deck.mainDeck, ...deck.extraDeck, ...deck.sideDeck];
    return all.filter(c => c.points >= 15).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [deck]);

  // World-class Keyboard Ergonomics: [ / p for prev deck, ] / n for next deck, v to toggle view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form controls
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.key === '[' || e.key === 'p' || e.key === 'P') {
        if (prevDeck) {
          e.preventDefault();
          router.push(`/tournaments/${tournament.id}/decks/${prevDeck.id}`);
        }
      } else if (e.key === ']' || e.key === 'n' || e.key === 'N') {
        if (nextDeck) {
          e.preventDefault();
          router.push(`/tournaments/${tournament.id}/decks/${nextDeck.id}`);
        }
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setViewMode(prev => (prev === 'visual' ? 'text' : 'visual'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDeck, nextDeck, router, tournament.id]);

  const handleCopyText = () => {
    const text = generateTextDecklist(deck);
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2400);
      });
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const canonicalUrl = `${window.location.origin}/tournaments/${tournament.id}/decks/${deck.id}`;
      navigator.clipboard.writeText(canonicalUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2400);
      });
    }
  };

  const handleDownloadYdk = () => {
    const ydk = generateYdkContent(deck);
    const blob = new Blob([ydk], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = `${deck.name.replace(/[^a-zA-Z0-9]/g, '_')}_${deck.archetype.replace(/[^a-zA-Z0-9]/g, '_')}.ydk`;
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const openCardModal = (cardItem: DeckCardItem, list?: DeckCardItem[], index?: number, sectionName?: string) => {
    const found = getKnownCard(cardItem.cardId, cardItem.name);
    if (found) {
      setInspectCard(found);
    } else {
      setInspectCard({
        id: cardItem.cardId,
        name: cardItem.name,
        type: cardItem.type,
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
        points: cardItem.points,
        ban_tcg: null,
        images: [{
          id: cardItem.cardId,
          image_url: cardItem.imageUrl.replace('_small', '').replace('_cropped', ''),
          image_url_small: cardItem.imageUrl,
          image_url_cropped: cardItem.imageCropped,
        }],
      });
    }

    if (list && index !== undefined) {
      setInspectList(list);
      setInspectIndex(index);
      setInspectSection(sectionName || '');
    } else {
      const allCards = [...deck.mainDeck, ...deck.extraDeck, ...deck.sideDeck];
      const idx = allCards.findIndex(c => c.cardId === cardItem.cardId || c.name.toLowerCase() === cardItem.name.toLowerCase());
      setInspectList(allCards);
      setInspectIndex(idx >= 0 ? idx : 0);
      setInspectSection(cardItem.section ? `${cardItem.section.toUpperCase()} DECK` : 'DECK');
    }
  };

  const handleNextModalCard = () => {
    if (inspectIndex >= 0 && inspectIndex < inspectList.length - 1) {
      const nextItem = inspectList[inspectIndex + 1];
      openCardModal(nextItem, inspectList, inspectIndex + 1, inspectSection);
    }
  };

  const handlePrevModalCard = () => {
    if (inspectIndex > 0) {
      const prevItem = inspectList[inspectIndex - 1];
      openCardModal(prevItem, inspectList, inspectIndex - 1, inspectSection);
    }
  };

  const getPointBadgeStyle = (points: number) => {
    if (points >= 50) return { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 0.7)', color: '#f87171' };
    if (points >= 15) return { bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.7)', color: '#fbbf24' };
    if (points > 0) return { bg: 'rgba(6, 182, 212, 0.25)', border: 'rgba(6, 182, 212, 0.7)', color: '#38bdf8' };
    return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', color: '#34d399' };
  };

  const filterCards = (cards: DeckCardItem[]) => {
    if (!filterQuery.trim()) return cards;
    const q = filterQuery.toLowerCase();
    return cards.filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));
  };

  const renderCardGrid = (cards: DeckCardItem[], sectionTitle: string = 'Deck') => {
    const list = filterCards(cards);
    if (list.length === 0) {
      return (
        <div style={{ padding: '16px 0', color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
          No matching cards in this section.
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
          gap: 10,
        }}
      >
        {list.map((cardItem, index) => {
          const badgeStyle = getPointBadgeStyle(cardItem.points);
          return (
            <div
              key={`${cardItem.section}-${cardItem.cardId}-${cardItem.name}`}
              onClick={() => openCardModal(cardItem, list, index, sectionTitle)}
              title={`${cardItem.name} — ${cardItem.points} pts each (${cardItem.count}x)`}
              style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--color-cyan)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 240, 255, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card Image */}
              <div style={{ aspectRatio: '421 / 614', width: '100%', position: 'relative', background: '#080a0f' }}>
                {getProxiedImageUrl(cardItem.cardId, 'small', cardItem.imageUrl) ? (
                  <img
                    src={getProxiedImageUrl(cardItem.cardId, 'small', cardItem.imageUrl)}
                    alt={cardItem.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      color: 'var(--text-muted)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', marginBottom: 4 }}>🃏</span>
                    <span style={{ color: '#fff', fontSize: '0.65rem', lineHeight: 1.2 }}>{cardItem.name}</span>
                  </div>
                )}

                {/* Quantity Badge (Top-Left) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    background: 'rgba(7, 9, 14, 0.92)',
                    border: '1px solid var(--border-medium)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    padding: '1px 6px',
                    borderRadius: 4,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
                  }}
                >
                  {cardItem.count}×
                </div>

                {/* Point Badge (Top-Right) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: badgeStyle.bg,
                    border: `1px solid ${badgeStyle.border}`,
                    color: badgeStyle.color,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.675rem',
                    padding: '1px 5px',
                    borderRadius: 4,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
                  }}
                >
                  {cardItem.points}p
                </div>
              </div>

              {/* Card Name Footer */}
              <div
                style={{
                  padding: '4px 6px',
                  background: 'rgba(11, 15, 23, 0.95)',
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}
              >
                {cardItem.name}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTextChecklist = (cards: DeckCardItem[], title: string, totalCount: number, totalPoints: number) => {
    const list = filterCards(cards);
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{title}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>({totalCount} cards)</span>
          </h4>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: totalPoints > 0 ? 'var(--color-gold-light)' : 'var(--text-dim)', fontWeight: 700 }}>
            {totalPoints} PTS
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-dim)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '6px 8px', width: 44 }}>Qty</th>
                <th style={{ padding: '6px 8px' }}>Card Name</th>
                <th style={{ padding: '6px 8px' }}>Category</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', width: 80 }}>Pts Ea.</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', width: 90 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c, index) => (
                <tr
                  key={`${c.section}-${c.cardId}-${c.name}`}
                  onClick={() => openCardModal(c, list, index, title)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff' }}>
                    {c.count}×
                  </td>
                  <td style={{ padding: '6px 8px', color: '#fff', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getProxiedImageUrl(c.cardId, 'cropped', c.imageCropped) ? (
                        <img
                          src={getProxiedImageUrl(c.cardId, 'cropped', c.imageCropped)}
                          alt=""
                          style={{ width: 20, height: 20, borderRadius: 3, objectFit: 'cover' }}
                        />
                      ) : null}
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {c.type}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: c.points > 0 ? 'var(--color-cyan)' : 'var(--text-dim)' }}>
                    {c.points}p
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: c.totalPoints > 0 ? 'var(--color-gold-light)' : 'var(--text-dim)' }}>
                    {c.totalPoints}p
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getPlacementBadge = (rank: number) => {
    if (rank === 1) return { text: '🏆 1st Place Champion', bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.7)', color: 'var(--color-gold-light)' };
    if (rank === 2) return { text: '🥈 2nd Place Finalist', bg: 'rgba(203, 213, 225, 0.2)', border: 'rgba(203, 213, 225, 0.6)', color: '#e2e8f0' };
    if (rank <= 4) return { text: '🥉 Top 4 Semifinalist', bg: 'rgba(56, 189, 248, 0.2)', border: 'rgba(56, 189, 248, 0.6)', color: 'var(--color-cyan)' };
    if (rank <= 8) return { text: 'Top 8 Quarterfinalist', bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.5)', color: '#c084fc' };
    if (rank <= 16) return { text: 'Top 16 Qualifier', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', color: '#34d399' };
    return { text: `Top ${tournament.totalDecks} (Seed #${rank})`, bg: 'rgba(255, 255, 255, 0.08)', border: 'var(--border-subtle)', color: 'var(--text-muted)' };
  };

  const placement = getPlacementBadge(deck.rank);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 60px 16px', width: '100%', flex: 1 }}>
      {/* 1. Ergonomic Breadcrumb Navigation */}
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
        <Link href={`/tournaments/${tournament.id}`} style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
          Decks
        </Link>
        <span>›</span>
        <span style={{ color: '#fff', fontWeight: 700 }}>
          {deck.name} ({deck.archetype})
        </span>
      </div>

      {/* 2. Tournament Context & Switcher Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          borderLeft: '4px solid var(--color-cyan)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1rem' }}>🏆</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                  href={`/tournaments/${tournament.id}`}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                  }}
                  title="View full tournament overview and all decklists"
                >
                  {tournament.title}
                </Link>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'rgba(2, 132, 199, 0.2)',
                    color: 'var(--color-cyan)',
                    border: '1px solid rgba(2, 132, 199, 0.4)',
                    fontWeight: 700,
                  }}
                >
                  {tournament.tier}
                </span>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: 2 }}>
                📅 {tournament.date} • 📍 {tournament.location} • 📜 {tournament.format}
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Switcher Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Switch Event:
          </label>
          <select
            value={tournament.id}
            onChange={e => {
              const targetTourney = getTournamentById(e.target.value);
              if (targetTourney && targetTourney.decks.length > 0) {
                router.push(`/tournaments/${targetTourney.id}/decks/${targetTourney.decks[0].id}`);
              } else {
                router.push(`/tournaments/${e.target.value}`);
              }
            }}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {allTournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.shortTitle} ({t.totalDecks} Decks)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Hero Deck Profile Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(11, 15, 23, 0.95) 0%, rgba(17, 24, 39, 0.85) 100%)',
          border: deck.rank === 1 ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)',
          boxShadow: deck.rank === 1 ? '0 0 28px rgba(245, 158, 11, 0.2)' : 'var(--shadow-md)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Signature Card Thumbnail Hero */}
          <div
            onClick={() => {
              const sig = deck.mainDeck.find(c => c.name === deck.signatureCard) ||
                          deck.extraDeck.find(c => c.name === deck.signatureCard) ||
                          deck.sideDeck.find(c => c.name === deck.signatureCard);
              if (sig) openCardModal(sig);
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#040608',
              border: deck.rank === 1 ? '2px solid var(--color-gold)' : '2px solid var(--color-cyan)',
              flexShrink: 0,
              position: 'relative',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
            }}
            title={`Click to inspect signature card: ${deck.signatureCard}`}
          >
            {getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl) ? (
              <img
                src={getDeckThumbnailUrl(deck.signatureCardId, deck.thumbnailUrl)}
                alt={deck.signatureCard}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                insetInline: 0,
                background: 'rgba(0,0,0,0.8)',
                fontSize: '0.65rem',
                textAlign: 'center',
                color: 'var(--color-gold-light)',
                fontWeight: 800,
                padding: '2px 0',
              }}
            >
              #{deck.rank} SEED
            </div>
          </div>

          {/* Player & Archetype Info */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span
                style={{
                  background: placement.bg,
                  border: `1px solid ${placement.border}`,
                  color: placement.color,
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.5px',
                }}
              >
                {placement.text}
              </span>

              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ✓ 100/100 BUDGET LEGAL
              </span>
            </div>

            <h1
              style={{
                margin: '0 0 4px 0',
                color: '#fff',
                fontSize: '1.9rem',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.5px',
              }}
            >
              {deck.name}
            </h1>

            <div
              style={{
                fontSize: '1.1rem',
                color: 'var(--color-cyan)',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              {deck.archetype}
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Signature: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.signatureCard}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Main: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.counts.main} cards</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Extra: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.counts.extra} cards</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Side: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.counts.side} cards</span>
              </div>
            </div>
          </div>

          {/* Quick Prev / Next Deck Cycling & Jump Dropdown */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              {prevDeck ? (
                <Link
                  href={`/tournaments/${tournament.id}/decks/${prevDeck.id}`}
                  className="btn btn-sm btn-secondary"
                  title={`Previous Deck: #${prevDeck.rank} ${prevDeck.name} (${prevDeck.archetype}) — Shortcut: [`}
                  style={{ textDecoration: 'none', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>← #{prevDeck.rank} {prevDeck.name}</span>
                  <kbd style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>[</kbd>
                </Link>
              ) : (
                <button disabled className="btn btn-sm btn-secondary" style={{ opacity: 0.4, cursor: 'not-allowed', fontSize: '0.775rem' }}>
                  ← First Seed
                </button>
              )}

              {nextDeck ? (
                <Link
                  href={`/tournaments/${tournament.id}/decks/${nextDeck.id}`}
                  className="btn btn-sm btn-secondary"
                  title={`Next Deck: #${nextDeck.rank} ${nextDeck.name} (${nextDeck.archetype}) — Shortcut: ]`}
                  style={{ textDecoration: 'none', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>#{nextDeck.rank} {nextDeck.name} →</span>
                  <kbd style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>]</kbd>
                </Link>
              ) : (
                <button disabled className="btn btn-sm btn-secondary" style={{ opacity: 0.4, cursor: 'not-allowed', fontSize: '0.775rem' }}>
                  Last Seed →
                </button>
              )}
            </div>

            {/* Quick Player & Seed Jump Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                Jump to Seed:
              </label>
              <select
                value={deck.id}
                onChange={e => router.push(`/tournaments/${tournament.id}/decks/${e.target.value}`)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: 220,
                }}
              >
                {tournament.decks.map(d => (
                  <option key={d.id} value={d.id}>
                    #{d.rank} {d.name} ({d.archetype})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Genesys 100-Point Budget Meter & High Point Investments */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Genesys Format 100-Point Budget Breakdown
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Official Format Rule: Every competitive deck is capped at exactly 100 points maximum across Main, Extra, and Side Decks.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: 'var(--font-mono)' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: deck.pointsSummary.total === 100 ? 'var(--color-gold-light)' : 'var(--color-cyan)' }}>
              {deck.pointsSummary.total}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ 100 PTS</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                fontWeight: 700,
                marginLeft: 4,
              }}
            >
              100% UTILIZED
            </span>
          </div>
        </div>

        {/* Point Breakdown Bar */}
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: 10,
          }}
        >
          <div
            title={`Main Deck: ${deck.pointsSummary.main} pts`}
            style={{
              width: `${(deck.pointsSummary.main / 100) * 100}%`,
              background: 'linear-gradient(90deg, #0284c7, #00f0ff)',
            }}
          />
          <div
            title={`Extra Deck: ${deck.pointsSummary.extra} pts`}
            style={{
              width: `${(deck.pointsSummary.extra / 100) * 100}%`,
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            }}
          />
          <div
            title={`Side Deck: ${deck.pointsSummary.side} pts`}
            style={{
              width: `${(deck.pointsSummary.side / 100) * 100}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-cyan)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-cyan)' }} />
              Main Deck: <strong>{deck.pointsSummary.main} pts</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-gold-light)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-gold)' }} />
              Extra Deck: <strong>{deck.pointsSummary.extra} pts</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />
              Side Deck: <strong>{deck.pointsSummary.side} pts</strong>
            </span>
          </div>

          <div style={{ color: 'var(--text-dim)' }}>
            Unused Budget: <strong>{deck.pointsSummary.remaining} pts</strong>
          </div>
        </div>

        {/* High Point Investments Pill Row */}
        {highPointCards.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
              Primary Point Investments (≥ 15 pts):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {highPointCards.map(c => {
                const b = getPointBadgeStyle(c.points);
                return (
                  <button
                    key={`high-${c.section}-${c.cardId}`}
                    onClick={() => openCardModal(c)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: `1px solid ${b.border}`,
                      borderRadius: 6,
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: '#fff',
                    }}
                    title={`Click to inspect ${c.name} (${c.points} pts)`}
                  >
                    <span style={{ color: b.color, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {c.points}p
                    </span>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>×{c.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4b. Deck Composition & Card Type Curve */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Deck Composition &amp; Card Type Distribution
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Total: {deck.counts.main + deck.counts.extra + deck.counts.side} cards • Main: {deck.counts.main} • Extra: {deck.counts.extra} • Side: {deck.counts.side}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-gold)' }} />
              Monsters: <strong>{monsters.reduce((a, b) => a + b.count, 0)} ({((monsters.reduce((a, b) => a + b.count, 0) / deck.counts.main) * 100).toFixed(0)}%)</strong>
            </span>
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />
              Spells: <strong>{spells.reduce((a, b) => a + b.count, 0)} ({((spells.reduce((a, b) => a + b.count, 0) / deck.counts.main) * 100).toFixed(0)}%)</strong>
            </span>
            <span style={{ color: '#f472b6', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ec4899' }} />
              Traps: <strong>{traps.reduce((a, b) => a + b.count, 0)} ({((traps.reduce((a, b) => a + b.count, 0) / deck.counts.main) * 100).toFixed(0)}%)</strong>
            </span>
          </div>
        </div>

        {/* Horizontal Main Deck Card Type Ratio Bar */}
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: 10,
          }}
        >
          <div
            title={`Monsters: ${monsters.reduce((a, b) => a + b.count, 0)}`}
            style={{
              width: `${(monsters.reduce((a, b) => a + b.count, 0) / deck.counts.main) * 100}%`,
              background: 'linear-gradient(90deg, #d97706, #f59e0b)',
            }}
          />
          <div
            title={`Spells: ${spells.reduce((a, b) => a + b.count, 0)}`}
            style={{
              width: `${(spells.reduce((a, b) => a + b.count, 0) / deck.counts.main) * 100}%`,
              background: 'linear-gradient(90deg, #059669, #10b981)',
            }}
          />
          <div
            title={`Traps: ${traps.reduce((a, b) => a + b.count, 0)}`}
            style={{
              width: `${(traps.reduce((a, b) => a + b.count, 0) / deck.counts.main) * 100}%`,
              background: 'linear-gradient(90deg, #db2777, #ec4899)',
            }}
          />
        </div>

        {/* Extra Deck Mechanics Breakdown */}
        {deck.counts.extra > 0 && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Extra Deck:</span>
            {fusions.length > 0 && (
              <span style={{ color: '#c084fc', fontWeight: 600 }}>
                🟣 Fusion: {fusions.reduce((a, b) => a + b.count, 0)}
              </span>
            )}
            {synchros.length > 0 && (
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                ⚪ Synchro: {synchros.reduce((a, b) => a + b.count, 0)}
              </span>
            )}
            {xyzs.length > 0 && (
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                ⚫ Xyz: {xyzs.reduce((a, b) => a + b.count, 0)}
              </span>
            )}
            <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', marginLeft: 'auto' }}>
              ⚠️ Pendulum &amp; Link prohibited in Genesys
            </span>
          </div>
        )}
      </div>

      {/* 5. Action Toolbar: View Mode, Filter, Copy & Simulator Download */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left: View Mode Toggle & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: 3, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('visual')}
              style={{
                background: viewMode === 'visual' ? 'var(--bg-surface-raised)' : 'transparent',
                border: 'none',
                color: viewMode === 'visual' ? 'var(--color-cyan)' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Shortcut: Press V to toggle view"
            >
              <span>⊞</span>
              <span>Visual Cardboard</span>
              <kbd style={{ fontSize: '0.625rem', padding: '1px 4px', borderRadius: 3, background: 'rgba(255,255,255,0.08)', color: 'var(--text-dim)' }}>V</kbd>
            </button>
            <button
              onClick={() => setViewMode('text')}
              style={{
                background: viewMode === 'text' ? 'var(--bg-surface-raised)' : 'transparent',
                border: 'none',
                color: viewMode === 'text' ? 'var(--color-cyan)' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Shortcut: Press V to toggle view"
            >
              <span>☰</span>
              <span>Text / Deck Sheet</span>
              <kbd style={{ fontSize: '0.625rem', padding: '1px 4px', borderRadius: 3, background: 'rgba(255,255,255,0.08)', color: 'var(--text-dim)' }}>V</kbd>
            </button>
          </div>

          {/* In-deck search input */}
          <input
            type="text"
            placeholder="Search cards in deck..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: '0.775rem',
              outline: 'none',
              width: 180,
            }}
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Export, Print & Simulator actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyText}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Copy decklist with card counts and points to clipboard"
          >
            <span>{copiedText ? '✓ Copied Deck!' : '📋 Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadYdk}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Download standard Yu-Gi-Oh simulator .ydk file (EDOPro, Omega, DuelingBook)"
          >
            <span>💾 Download .YDK</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Print official tournament deck sheet"
          >
            <span>🖨️ Print Sheet</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: 6 }}
            title="Copy shareable link to this deck"
          >
            <span>{copiedLink ? '✓ Copied Link!' : '🔗 Share'}</span>
          </button>
        </div>
      </div>

      {/* Section Quick Jump Filter Pills (Visual mode) */}
      {viewMode === 'visual' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { id: 'all' as const, label: `All Sections (${deck.counts.main + deck.counts.extra + deck.counts.side})` },
            { id: 'monsters' as const, label: `Monsters (${monsters.reduce((a, b) => a + b.count, 0)})` },
            { id: 'spells' as const, label: `Spells (${spells.reduce((a, b) => a + b.count, 0)})` },
            { id: 'traps' as const, label: `Traps (${traps.reduce((a, b) => a + b.count, 0)})` },
            { id: 'extra' as const, label: `Extra Deck (${deck.counts.extra})` },
            { id: 'side' as const, label: `Side Deck (${deck.counts.side})` },
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setSectionFilter(sec.id)}
              style={{
                background: sectionFilter === sec.id ? 'var(--color-cyan)' : 'var(--bg-surface)',
                color: sectionFilter === sec.id ? '#07090e' : 'var(--text-muted)',
                border: `1px solid ${sectionFilter === sec.id ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      )}

      {/* 6. Deckboard Content (Visual Cardboard or Text Checklist) */}
      {viewMode === 'visual' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Deck Container */}
          {['all', 'monsters', 'spells', 'traps'].includes(sectionFilter) && (
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Main Deck</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({deck.counts.main} cards)
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    {monsters.reduce((acc, c) => acc + c.count, 0)} Monsters • {spells.reduce((acc, c) => acc + c.count, 0)} Spells • {traps.reduce((acc, c) => acc + c.count, 0)} Traps
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-cyan)' }}>
                    {deck.pointsSummary.main} PTS
                  </span>
                </div>
              </div>

              {/* Monsters Section */}
              {['all', 'monsters'].includes(sectionFilter) && monsters.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold-light)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Monsters ({monsters.reduce((acc, c) => acc + c.count, 0)})
                  </div>
                  {renderCardGrid(monsters, 'Main Deck Monsters')}
                </div>
              )}

              {/* Spells Section */}
              {['all', 'spells'].includes(sectionFilter) && spells.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Spells ({spells.reduce((acc, c) => acc + c.count, 0)})
                  </div>
                  {renderCardGrid(spells, 'Main Deck Spells')}
                </div>
              )}

              {/* Traps Section */}
              {['all', 'traps'].includes(sectionFilter) && traps.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Traps ({traps.reduce((acc, c) => acc + c.count, 0)})
                  </div>
                  {renderCardGrid(traps, 'Main Deck Traps')}
                </div>
              )}
            </div>
          )}

          {/* Extra Deck Container */}
          {['all', 'extra'].includes(sectionFilter) && (
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Extra Deck</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({deck.counts.extra} cards)
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    Fusion, Synchro, and Xyz Monsters (Link &amp; Pendulum monsters are prohibited in Genesys)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-gold-light)' }}>
                    {deck.pointsSummary.extra} PTS
                  </span>
                </div>
              </div>

              {renderCardGrid(deck.extraDeck, 'Extra Deck')}
            </div>
          )}

          {/* Side Deck Container */}
          {['all', 'side'].includes(sectionFilter) && (
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Side Deck</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({deck.counts.side} cards)
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    Match sideboard adjustments (counted against the 100-point budget cap)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                    {deck.pointsSummary.side} PTS
                  </span>
                </div>
              </div>

              {renderCardGrid(deck.sideDeck, 'Side Deck')}
            </div>
          )}
        </div>
      ) : (
        /* Text / Deck Sheet Checklist Mode */
        <div className="glass-panel" style={{ padding: 24 }}>
          {renderTextChecklist(deck.mainDeck, 'Main Deck', deck.counts.main, deck.pointsSummary.main)}
          {renderTextChecklist(deck.extraDeck, 'Extra Deck', deck.counts.extra, deck.pointsSummary.extra)}
          {renderTextChecklist(deck.sideDeck, 'Side Deck', deck.counts.side, deck.pointsSummary.side)}
        </div>
      )}

      {/* Card Inspector Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => {
            setInspectCard(null);
            setInspectIndex(-1);
            setInspectList([]);
          }}
          onNext={inspectIndex < inspectList.length - 1 ? handleNextModalCard : undefined}
          onPrev={inspectIndex > 0 ? handlePrevModalCard : undefined}
          currentIndex={inspectIndex >= 0 ? inspectIndex : undefined}
          totalCards={inspectList.length > 0 ? inspectList.length : undefined}
          deckSection={inspectSection}
        />
      )}
    </div>
  );
}
