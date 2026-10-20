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

interface PointInvestment {
  cardId: number;
  name: string;
  unitPoints: number;
  totalPoints: number;
  totalCount: number;
  mainCount: number;
  extraCount: number;
  sideCount: number;
  category: string;
  type: string;
  imageUrl: string;
  imageCropped: string;
  percentageOfBudget: number;
}

export function TournamentDeckView({
  tournament,
  deck,
}: TournamentDeckViewProps) {
  const router = useRouter();
  const { prevDeck, nextDeck } = getAdjacentDecks(tournament.id, deck.id);

  const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual');
  const [filterQuery, setFilterQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'main' | 'monsters' | 'spells' | 'traps' | 'extra' | 'side' | 'pointed'>('all');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inspectCard, setInspectCard] = useState<Card | null>(null);
  const [inspectList, setInspectList] = useState<DeckCardItem[]>([]);
  const [inspectIndex, setInspectIndex] = useState<number>(-1);
  const [inspectSection, setInspectSection] = useState<string>('');

  // All cards combined
  const allCards = useMemo(() => [...deck.mainDeck, ...deck.extraDeck, ...deck.sideDeck], [deck]);

  // Group Main Deck into Monsters, Spells, Traps
  const monsters = useMemo(() => deck.mainDeck.filter(c => c.category === 'monster'), [deck]);
  const spells = useMemo(() => deck.mainDeck.filter(c => c.category === 'spell'), [deck]);
  const traps = useMemo(() => deck.mainDeck.filter(c => c.category === 'trap'), [deck]);

  // Breakdown of Extra Deck mechanics
  const fusions = useMemo(() => deck.extraDeck.filter(c => c.type.toLowerCase().includes('fusion')), [deck]);
  const synchros = useMemo(() => deck.extraDeck.filter(c => c.type.toLowerCase().includes('synchro')), [deck]);
  const xyzs = useMemo(() => deck.extraDeck.filter(c => c.type.toLowerCase().includes('xyz')), [deck]);

  // Unified Point Investments Roster: Aggregates every card with points > 0 across Main, Extra, and Side
  const pointInvestments = useMemo<PointInvestment[]>(() => {
    const map = new Map<string, PointInvestment>();
    const budget = deck.pointsSummary?.budget || 100;

    const ingest = (c: DeckCardItem, section: 'main' | 'extra' | 'side') => {
      if (c.points <= 0) return;
      const key = `${c.cardId}_${c.name.toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.totalCount += c.count;
        existing.totalPoints += c.totalPoints;
        if (section === 'main') existing.mainCount += c.count;
        if (section === 'extra') existing.extraCount += c.count;
        if (section === 'side') existing.sideCount += c.count;
        existing.percentageOfBudget = (existing.totalPoints / budget) * 100;
      } else {
        map.set(key, {
          cardId: c.cardId,
          name: c.name,
          unitPoints: c.points,
          totalPoints: c.totalPoints,
          totalCount: c.count,
          mainCount: section === 'main' ? c.count : 0,
          extraCount: section === 'extra' ? c.count : 0,
          sideCount: section === 'side' ? c.count : 0,
          category: c.category,
          type: c.type,
          imageUrl: c.imageUrl,
          imageCropped: c.imageCropped,
          percentageOfBudget: (c.totalPoints / budget) * 100,
        });
      }
    };

    deck.mainDeck.forEach(c => ingest(c, 'main'));
    deck.extraDeck.forEach(c => ingest(c, 'extra'));
    deck.sideDeck.forEach(c => ingest(c, 'side'));

    return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints || b.unitPoints - a.unitPoints);
  }, [deck]);

  // World-class Keyboard Ergonomics: [ / p for prev deck, ] / n for next deck, v to toggle view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Point chip styling based on point investment weight
  const getCardPointStyle = (totalPoints: number) => {
    if (totalPoints <= 0) return null;
    if (totalPoints >= 25) {
      return {
        border: '1.5px solid rgba(245, 158, 11, 0.95)',
        boxShadow: '0 0 12px rgba(245, 158, 11, 0.45)',
        badgeBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(180, 83, 9, 0.95))',
        badgeBorder: 'rgba(251, 191, 36, 0.85)',
        badgeColor: '#ffffff',
        glowColor: '#fbbf24',
      };
    }
    if (totalPoints >= 10) {
      return {
        border: '1.5px solid rgba(251, 146, 60, 0.9)',
        boxShadow: '0 0 10px rgba(251, 146, 60, 0.35)',
        badgeBg: 'linear-gradient(135deg, rgba(234, 88, 12, 0.92), rgba(194, 65, 12, 0.92))',
        badgeBorder: 'rgba(253, 186, 116, 0.75)',
        badgeColor: '#ffffff',
        glowColor: '#fdba74',
      };
    }
    if (totalPoints >= 5) {
      return {
        border: '1.5px solid rgba(0, 240, 255, 0.85)',
        boxShadow: '0 0 9px rgba(0, 240, 255, 0.35)',
        badgeBg: 'linear-gradient(135deg, rgba(2, 132, 199, 0.92), rgba(3, 105, 161, 0.92))',
        badgeBorder: 'rgba(56, 189, 248, 0.75)',
        badgeColor: '#ffffff',
        glowColor: '#38bdf8',
      };
    }
    return {
      border: '1.5px solid rgba(16, 185, 129, 0.8)',
      boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
      badgeBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.92), rgba(5, 150, 105, 0.92))',
      badgeBorder: 'rgba(52, 211, 153, 0.75)',
      badgeColor: '#ffffff',
      glowColor: '#34d399',
    };
  };

  const filterCards = (cards: DeckCardItem[]) => {
    let list = cards;
    if (sectionFilter === 'pointed') {
      list = list.filter(c => c.points > 0);
    }
    if (!filterQuery.trim()) return list;
    const q = filterQuery.toLowerCase();
    return list.filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));
  };

  const renderCardGrid = (cards: DeckCardItem[], sectionTitle: string = 'Deck') => {
    const list = filterCards(cards);
    if (list.length === 0) {
      return (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
          No matching cards in this section.
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 10,
        }}
      >
        {list.map((cardItem, index) => {
          const pointStyle = getCardPointStyle(cardItem.totalPoints);
          return (
            <div
              key={`${cardItem.section}-${cardItem.cardId}-${cardItem.name}`}
              onClick={() => openCardModal(cardItem, list, index, sectionTitle)}
              title={`${cardItem.name} — ${cardItem.points > 0 ? `${cardItem.totalPoints} PTS (${cardItem.count}× @ ${cardItem.points}p ea)` : '0 PTS'}`}
              style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--bg-surface-raised)',
                border: pointStyle ? pointStyle.border : '1px solid var(--border-subtle)',
                boxShadow: pointStyle ? pointStyle.boxShadow : 'none',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                if (pointStyle) {
                  e.currentTarget.style.boxShadow = `0 8px 20px ${pointStyle.glowColor}55`;
                } else {
                  e.currentTarget.style.borderColor = 'var(--color-cyan)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 240, 255, 0.25)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.border = pointStyle ? pointStyle.border : '1px solid var(--border-subtle)';
                e.currentTarget.style.boxShadow = pointStyle ? pointStyle.boxShadow : 'none';
              }}
            >
              {/* Card Image Frame */}
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
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.725rem',
                    padding: '1px 5px',
                    borderRadius: 4,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.7)',
                    zIndex: 2,
                  }}
                >
                  {cardItem.count}×
                </div>

                {/* Point Chip (Top-Right) - ONLY FOR POINT-BEARING CARDS */}
                {pointStyle && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: pointStyle.badgeBg,
                      border: `1px solid ${pointStyle.badgeBorder}`,
                      color: pointStyle.badgeColor,
                      fontFamily: 'var(--font-mono)',
                      borderRadius: 4,
                      padding: cardItem.count > 1 ? '1px 5px' : '2px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1.1,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
                      zIndex: 2,
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: '0.725rem' }}>
                      {cardItem.totalPoints}p
                    </span>
                    {cardItem.count > 1 && (
                      <span style={{ fontSize: '0.55rem', opacity: 0.92, fontWeight: 700 }}>
                        {cardItem.points} ea
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Name Footer with Point Subtotal */}
              <div
                style={{
                  padding: '4px 6px',
                  background: pointStyle ? 'rgba(7, 9, 14, 0.98)' : 'rgba(11, 15, 23, 0.95)',
                  borderTop: pointStyle ? `1px solid ${pointStyle.badgeBorder}44` : '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 600,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                    textAlign: pointStyle ? 'left' : 'center',
                  }}
                >
                  {cardItem.name}
                </span>
                {pointStyle && (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: pointStyle.glowColor,
                      flexShrink: 0,
                    }}
                  >
                    {cardItem.totalPoints}p
                  </span>
                )}
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
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
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
                          style={{ width: 22, height: 22, borderRadius: 3, objectFit: 'cover' }}
                        />
                      ) : null}
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {c.type}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: c.points > 0 ? 'var(--color-cyan)' : 'var(--text-dim)' }}>
                    {c.points > 0 ? `${c.points}p` : '—'}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: c.totalPoints > 0 ? 'var(--color-gold-light)' : 'var(--text-dim)' }}>
                    {c.totalPoints > 0 ? `${c.totalPoints} PTS` : '—'}
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
    if (rank === 1) return { text: '🏆 Champion (1st)', bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.7)', color: 'var(--color-gold-light)' };
    if (rank === 2) return { text: '🥈 Finalist (2nd)', bg: 'rgba(203, 213, 225, 0.2)', border: 'rgba(203, 213, 225, 0.6)', color: '#e2e8f0' };
    if (rank <= 4) return { text: '🥉 Top 4 Semifinalist', bg: 'rgba(56, 189, 248, 0.2)', border: 'rgba(56, 189, 248, 0.6)', color: 'var(--color-cyan)' };
    if (rank <= 8) return { text: 'Top 8 Quarterfinalist', bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.5)', color: '#c084fc' };
    if (rank <= 16) return { text: 'Top 16 Qualifier', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', color: '#34d399' };
    return { text: `Top ${tournament.totalDecks} (Seed #${rank})`, bg: 'rgba(255, 255, 255, 0.08)', border: 'var(--border-subtle)', color: 'var(--text-muted)' };
  };

  const placement = getPlacementBadge(deck.rank);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 60px 16px', width: '100%', flex: 1 }}>
      {/* 1. Sleek Top Navigation Bar: Breadcrumbs + Seed Pager */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          margin: '16px 0 12px 0',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
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
          <span style={{ color: '#fff', fontWeight: 700 }}>
            #{deck.rank} {deck.name}
          </span>
        </div>

        {/* Right: Ergonomic Seed Pager & Jump Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {prevDeck ? (
            <Link
              href={`/tournaments/${tournament.id}/decks/${prevDeck.id}`}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px', textDecoration: 'none' }}
              title={`Previous Seed: #${prevDeck.rank} ${prevDeck.name} — Hotkey: [`}
            >
              <span>← #{prevDeck.rank}</span>
            </Link>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '4px 8px' }}>First Seed</span>
          )}

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
            title="Jump to any deck in this tournament"
          >
            {tournament.decks.map(d => (
              <option key={d.id} value={d.id}>
                #{d.rank} {d.name} ({d.archetype})
              </option>
            ))}
          </select>

          {nextDeck ? (
            <Link
              href={`/tournaments/${tournament.id}/decks/${nextDeck.id}`}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px', textDecoration: 'none' }}
              title={`Next Seed: #${nextDeck.rank} ${nextDeck.name} — Hotkey: ]`}
            >
              <span>#{nextDeck.rank} →</span>
            </Link>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '4px 8px' }}>Last Seed</span>
          )}
        </div>
      </div>

      {/* 2. Unified Master Hero Header (Identity + Deck Composition + Action Suite) */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 22px',
          marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(11, 15, 23, 0.95) 0%, rgba(19, 25, 36, 0.88) 100%)',
          border: deck.rank === 1 ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)',
          boxShadow: deck.rank === 1 ? '0 0 28px rgba(245, 158, 11, 0.2)' : 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Signature Card Showcase Thumbnail */}
          <div
            onClick={() => {
              const sig = allCards.find(c => c.name.toLowerCase() === deck.signatureCard.toLowerCase() || c.cardId === deck.signatureCardId);
              if (sig) openCardModal(sig);
            }}
            style={{
              width: 80,
              height: 104,
              borderRadius: 8,
              overflow: 'hidden',
              background: '#040608',
              border: deck.rank === 1 ? '2px solid var(--color-gold)' : '2px solid var(--color-cyan)',
              flexShrink: 0,
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
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
                background: 'rgba(7, 9, 14, 0.92)',
                fontSize: '0.625rem',
                textAlign: 'center',
                color: 'var(--color-gold-light)',
                fontWeight: 800,
                padding: '2px 0',
              }}
            >
              #{deck.rank} SEED
            </div>
          </div>

          {/* Player Identity & Composition Ticker */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span
                style={{
                  background: placement.bg,
                  border: `1px solid ${placement.border}`,
                  color: placement.color,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {placement.text}
              </span>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ✓ 100/100 PTS LEGAL
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {tournament.shortTitle}
              </span>
            </div>

            <h1
              style={{
                margin: '0 0 2px 0',
                color: '#fff',
                fontSize: '1.65rem',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.5px',
              }}
            >
              {deck.name}
            </h1>

            <div
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-cyan)',
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              {deck.archetype}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Signature: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.signatureCard}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Main: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.counts.main}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginLeft: 4 }}>
                  ({monsters.reduce((a, b) => a + b.count, 0)}⚔️ {spells.reduce((a, b) => a + b.count, 0)}📜 {traps.reduce((a, b) => a + b.count, 0)}🛡️)
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Extra: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.counts.extra}</span>
                {xyzs.length > 0 && <span style={{ color: '#38bdf8', fontSize: '0.7rem', marginLeft: 4 }}>(Xyz)</span>}
                {fusions.length > 0 && <span style={{ color: '#c084fc', fontSize: '0.7rem', marginLeft: 4 }}>(Fusion)</span>}
                {synchros.length > 0 && <span style={{ color: '#e2e8f0', fontSize: '0.7rem', marginLeft: 4 }}>(Synchro)</span>}
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Side: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{deck.counts.side}</span>
              </div>
            </div>
          </div>

          {/* Action Suite (Simulator .YDK, Copy, Share, Print) */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleDownloadYdk}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              title="Download standard Yu-Gi-Oh simulator .ydk file (EDOPro, Omega, DB)"
            >
              <span>💾 .YDK</span>
            </button>

            <button
              onClick={handleCopyText}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              title="Copy decklist to clipboard"
            >
              <span>{copiedText ? '✓ Copied!' : '📋 Copy'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              title="Copy share link"
            >
              <span>{copiedLink ? '✓ Linked!' : '🔗 Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              title="Print deck sheet"
            >
              <span>🖨️ Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Genesys 100-Point Budget Allocation & Investment Showcase */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: 16,
          borderLeft: '4px solid var(--color-gold)',
        }}
      >
        {/* Meter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>💎</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Genesys 100-Point Format Budget Allocation
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                {pointInvestments.length} cards utilized to reach {deck.pointsSummary.total} / 100 PTS cap
              </div>
            </div>
          </div>

          {/* Visual Gauge */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: 'var(--font-mono)' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: deck.pointsSummary.total === 100 ? 'var(--color-gold-light)' : 'var(--color-cyan)' }}>
              {deck.pointsSummary.total}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/ 100 PTS</span>
            <span
              style={{
                fontSize: '0.675rem',
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                fontWeight: 700,
              }}
            >
              100% UTILIZED
            </span>
          </div>
        </div>

        {/* Segmented Proportional Bar */}
        <div
          style={{
            height: 10,
            borderRadius: 5,
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: 8,
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

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: '0.725rem', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-cyan)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-cyan)' }} />
              Main Deck: <strong>{deck.pointsSummary.main} PTS</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-gold-light)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-gold)' }} />
              Extra Deck: <strong>{deck.pointsSummary.extra} PTS</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />
              Side Deck: <strong>{deck.pointsSummary.side} PTS</strong>
            </span>
          </div>

          <div style={{ color: 'var(--text-dim)' }}>
            Unused Budget: <strong>{deck.pointsSummary.remaining} PTS</strong>
          </div>
        </div>

        {/* Point Investment Roster (Complete Breakdown of all Pointed Cards) */}
        {pointInvestments.length > 0 && (
          <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                Primary Point Investments Breakdown ({pointInvestments.length} Cards):
              </div>
              <button
                onClick={() => setSectionFilter(prev => prev === 'pointed' ? 'all' : 'pointed')}
                style={{
                  background: sectionFilter === 'pointed' ? 'var(--color-cyan)' : 'rgba(255, 255, 255, 0.06)',
                  color: sectionFilter === 'pointed' ? '#07090e' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {sectionFilter === 'pointed' ? '✓ Showing Pointed Only' : '🔍 Filter Deckboard to Pointed'}
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 8,
              }}
            >
              {pointInvestments.map(card => {
                const pStyle = getCardPointStyle(card.totalPoints);
                return (
                  <div
                    key={`invest-${card.cardId}-${card.name}`}
                    onClick={() => {
                      const foundCard = getKnownCard(card.cardId, card.name);
                      if (foundCard) {
                        setInspectCard(foundCard);
                      } else {
                        openCardModal({
                          cardId: card.cardId,
                          name: card.name,
                          count: card.totalCount,
                          points: card.unitPoints,
                          totalPoints: card.totalPoints,
                          type: card.type,
                          category: card.category,
                          section: card.mainCount > 0 ? 'main' : 'side',
                          imageUrl: card.imageUrl,
                          imageCropped: card.imageCropped,
                        });
                      }
                    }}
                    style={{
                      background: 'var(--bg-primary)',
                      border: pStyle ? pStyle.border : '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.background = 'var(--bg-surface-raised)';
                      if (pStyle) e.currentTarget.style.boxShadow = `0 4px 12px ${pStyle.glowColor}44`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'var(--bg-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title={`Click to inspect ${card.name} (${card.totalPoints} PTS — ${card.percentageOfBudget.toFixed(0)}% of deck budget)`}
                  >
                    {/* Cropped Artwork */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 6,
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#040608',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {getProxiedImageUrl(card.cardId, 'cropped', card.imageCropped) ? (
                        <img
                          src={getProxiedImageUrl(card.cardId, 'cropped', card.imageCropped)}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                          🃏
                        </div>
                      )}
                    </div>

                    {/* Card Title & Section Counts */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {card.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.675rem', color: 'var(--text-dim)', marginTop: 2 }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {card.totalCount}× ({card.unitPoints}p ea)
                        </span>
                        <span>•</span>
                        <span>
                          {card.mainCount > 0 && card.sideCount > 0
                            ? `${card.mainCount} Main + ${card.sideCount} Side`
                            : card.mainCount > 0
                            ? `${card.mainCount} Main`
                            : `${card.sideCount} Side`}
                        </span>
                      </div>
                    </div>

                    {/* Total Points & Share */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          color: pStyle?.glowColor || 'var(--color-cyan)',
                        }}
                      >
                        {card.totalPoints} PTS
                      </div>
                      <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        {card.percentageOfBudget.toFixed(0)}% budget
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Unified Sticky Control Toolbar (View Mode + Section Filter Pills + Search) */}
      <div
        className="glass-panel"
        style={{
          position: 'sticky',
          top: 8,
          zIndex: 10,
          padding: '8px 12px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Left: View Mode Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewMode('visual')}
            style={{
              background: viewMode === 'visual' ? 'var(--bg-surface-raised)' : 'transparent',
              border: 'none',
              color: viewMode === 'visual' ? 'var(--color-cyan)' : 'var(--text-muted)',
              padding: '5px 10px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            title="Visual Cardboard (Hotkey: V)"
          >
            <span>⊞ Visual</span>
          </button>
          <button
            onClick={() => setViewMode('text')}
            style={{
              background: viewMode === 'text' ? 'var(--bg-surface-raised)' : 'transparent',
              border: 'none',
              color: viewMode === 'text' ? 'var(--color-cyan)' : 'var(--text-muted)',
              padding: '5px 10px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            title="Text / Deck Sheet (Hotkey: V)"
          >
            <span>☰ Sheet</span>
          </button>
        </div>

        {/* Center: Section Filter Pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'all' as const, label: `All (${deck.counts.main + deck.counts.extra + deck.counts.side})` },
            { id: 'main' as const, label: `Main (${deck.counts.main})` },
            { id: 'monsters' as const, label: `Monsters (${monsters.reduce((a, b) => a + b.count, 0)})` },
            { id: 'spells' as const, label: `Spells (${spells.reduce((a, b) => a + b.count, 0)})` },
            { id: 'traps' as const, label: `Traps (${traps.reduce((a, b) => a + b.count, 0)})` },
            { id: 'extra' as const, label: `Extra (${deck.counts.extra})` },
            { id: 'side' as const, label: `Side (${deck.counts.side})` },
            { id: 'pointed' as const, label: `⭐ Pointed (${pointInvestments.length})` },
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setSectionFilter(sec.id)}
              style={{
                background: sectionFilter === sec.id ? (sec.id === 'pointed' ? 'var(--color-gold)' : 'var(--color-cyan)') : 'rgba(255, 255, 255, 0.05)',
                color: sectionFilter === sec.id ? '#07090e' : (sec.id === 'pointed' ? 'var(--color-gold-light)' : 'var(--text-muted)'),
                border: `1px solid ${sectionFilter === sec.id ? (sec.id === 'pointed' ? 'var(--color-gold)' : 'var(--color-cyan)') : 'var(--border-subtle)'}`,
                borderRadius: 5,
                padding: '4px 8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Right: In-deck Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="text"
            placeholder="Search cards..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              padding: '5px 10px',
              borderRadius: 5,
              fontSize: '0.75rem',
              outline: 'none',
              width: 140,
            }}
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: '0.7rem', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 5. Deckboard Content: Visual Cardboard or Text Checklist */}
      {viewMode === 'visual' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Deck Container */}
          {['all', 'main', 'monsters', 'spells', 'traps', 'pointed'].includes(sectionFilter) && (
            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Main Deck</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({deck.counts.main} cards)
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    {monsters.reduce((acc, c) => acc + c.count, 0)} Monsters • {spells.reduce((acc, c) => acc + c.count, 0)} Spells • {traps.reduce((acc, c) => acc + c.count, 0)} Traps
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-cyan)' }}>
                    {deck.pointsSummary.main} PTS
                  </span>
                </div>
              </div>

              {/* Monsters */}
              {['all', 'main', 'monsters', 'pointed'].includes(sectionFilter) && monsters.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold-light)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                    Monsters ({monsters.reduce((acc, c) => acc + c.count, 0)})
                  </div>
                  {renderCardGrid(monsters, 'Main Deck Monsters')}
                </div>
              )}

              {/* Spells */}
              {['all', 'main', 'spells', 'pointed'].includes(sectionFilter) && spells.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                    Spells ({spells.reduce((acc, c) => acc + c.count, 0)})
                  </div>
                  {renderCardGrid(spells, 'Main Deck Spells')}
                </div>
              )}

              {/* Traps */}
              {['all', 'main', 'traps', 'pointed'].includes(sectionFilter) && traps.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                    Traps ({traps.reduce((acc, c) => acc + c.count, 0)})
                  </div>
                  {renderCardGrid(traps, 'Main Deck Traps')}
                </div>
              )}
            </div>
          )}

          {/* Extra Deck Container */}
          {['all', 'extra', 'pointed'].includes(sectionFilter) && deck.counts.extra > 0 && (
            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Extra Deck</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({deck.counts.extra} cards)
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    Xyz Monsters (Pendulum &amp; Link prohibited in Genesys format)
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
          {['all', 'side', 'pointed'].includes(sectionFilter) && deck.counts.side > 0 && (
            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Side Deck</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({deck.counts.side} cards)
                    </span>
                  </h3>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    Match sideboard adjustments (counted against 100-point budget)
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
        <div className="glass-panel" style={{ padding: 20 }}>
          {['all', 'main', 'monsters', 'spells', 'traps', 'pointed'].includes(sectionFilter) && (
            renderTextChecklist(deck.mainDeck, 'Main Deck', deck.counts.main, deck.pointsSummary.main)
          )}
          {['all', 'extra', 'pointed'].includes(sectionFilter) && (
            renderTextChecklist(deck.extraDeck, 'Extra Deck', deck.counts.extra, deck.pointsSummary.extra)
          )}
          {['all', 'side', 'pointed'].includes(sectionFilter) && (
            renderTextChecklist(deck.sideDeck, 'Side Deck', deck.counts.side, deck.pointsSummary.side)
          )}
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
