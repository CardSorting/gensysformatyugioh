'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardImage } from '@/types/card';
import { getProxiedImageUrl } from '@/lib/images';
import { getDecksFeaturingCard } from '@/lib/tournaments';
import { getKnownCard, resolveCardDetails } from '@/lib/card-lookup';

interface CardDetailModalProps {
  card: Card;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCards?: number;
  deckSection?: string;
}

export function CardDetailModal({
  card,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalCards,
  deckSection,
}: CardDetailModalProps) {
  // Determine if card needs enrichment
  const isStub =
    !card.desc ||
    card.desc.startsWith('Official tournament card') ||
    card.desc.trim() === '' ||
    (card.type.toLowerCase().includes('monster') && card.atk === null);

  // Synchronous initial attempt to pull complete metadata from 1,080+ pre-indexed cards
  const initialResolved = isStub ? getKnownCard(card.id, card.name) || card : card;

  const [activeCard, setActiveCard] = useState<Card>(initialResolved);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [prevCardId, setPrevCardId] = useState(card.id);
  const [copied, setCopied] = useState(false);
  const [isEnriching, setIsEnriching] = useState<boolean>(
    !initialResolved.desc ||
    initialResolved.desc.startsWith('Official tournament card') ||
    (initialResolved.type.toLowerCase().includes('monster') && initialResolved.atk === null)
  );

  // Re-sync when card prop changes (official React recommended pattern)
  if (card.id !== prevCardId) {
    setPrevCardId(card.id);
    setSelectedImageIndex(0);
    const quickLocal = getKnownCard(card.id, card.name) || card;
    setActiveCard(quickLocal);
    setIsEnriching(
      !quickLocal.desc ||
      quickLocal.desc.startsWith('Official tournament card') ||
      (quickLocal.type.toLowerCase().includes('monster') && quickLocal.atk === null)
    );
  }

  // Background resolver for any remaining external cards
  useEffect(() => {
    let active = true;
    const needsFetch =
      !activeCard.desc ||
      activeCard.desc.startsWith('Official tournament card') ||
      (activeCard.type.toLowerCase().includes('monster') && activeCard.atk === null);

    if (needsFetch) {
      resolveCardDetails(card.id, card.name, card.points)
        .then(enriched => {
          if (active && enriched) {
            setActiveCard(enriched);
            setIsEnriching(false);
          }
        })
        .catch(() => {
          if (active) setIsEnriching(false);
        });
    }

    return () => {
      active = false;
    };
  }, [card.id, card.name, card.points, activeCard.desc, activeCard.atk, activeCard.type]);

  const featuredTournamentDecks = useMemo(() => {
    return getDecksFeaturingCard(activeCard.id, activeCard.name);
  }, [activeCard.id, activeCard.name]);

  const handleCopyLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/card/${activeCard.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  }, [activeCard.id]);

  // Keyboard navigation: Escape to close, ArrowLeft for Prev, ArrowRight for Next, 'c' to copy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
        handleCopyLink();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, handleCopyLink]);

  const images: CardImage[] =
    activeCard.images && activeCard.images.length > 0
      ? activeCard.images
      : [
          {
            id: activeCard.id,
            image_url: `https://images.ygoprodeck.com/images/cards/${activeCard.id}.jpg`,
            image_url_small: `https://images.ygoprodeck.com/images/cards_small/${activeCard.id}.jpg`,
            image_url_cropped: `https://images.ygoprodeck.com/images/cards_cropped/${activeCard.id}.jpg`,
          },
        ];

  const currentImage = images[selectedImageIndex] || images[0];

  const getPointBadgeStyle = (points: number) => {
    if (points >= 50) {
      return {
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.5)',
        color: '#f87171',
        label: `${points} Points`,
        category: 'Heavy Point Investment (50-100 pts)',
      };
    }
    if (points >= 15) {
      return {
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.5)',
        color: '#fbbf24',
        label: `${points} Points`,
        category: 'Moderate Point Investment (15-49 pts)',
      };
    }
    if (points > 0) {
      return {
        bg: 'rgba(6, 182, 212, 0.15)',
        border: 'rgba(6, 182, 212, 0.5)',
        color: '#38bdf8',
        label: `${points} Points`,
        category: 'Low Point Investment (1-14 pts)',
      };
    }
    return {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      color: '#34d399',
      label: '0 Points (Unlisted / Free)',
      category: 'Unlisted Standard Card (0 pts)',
    };
  };

  const getAttributeStyle = (attribute?: string | null) => {
    switch (attribute?.toUpperCase()) {
      case 'LIGHT':
        return { color: '#fef08a', bg: 'rgba(254, 240, 138, 0.15)', border: 'rgba(254, 240, 138, 0.4)' };
      case 'DARK':
        return { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.4)' };
      case 'FIRE':
        return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.4)' };
      case 'WATER':
        return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)' };
      case 'EARTH':
        return { color: '#fde047', bg: 'rgba(202, 138, 4, 0.15)', border: 'rgba(202, 138, 4, 0.4)' };
      case 'WIND':
        return { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.4)' };
      case 'DIVINE':
        return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.5)' };
      default:
        return { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--border-subtle)' };
    }
  };

  const badge = getPointBadgeStyle(activeCard.points || 0);
  const attrStyle = getAttributeStyle(activeCard.attribute);

  // Check if Pendulum Monster and split effects if applicable
  const isPendulum =
    activeCard.type.toLowerCase().includes('pendulum') ||
    (activeCard.desc && activeCard.desc.includes('[ Pendulum Effect ]'));

  let pendulumEffect: string | null = null;
  let monsterEffect: string = activeCard.desc || '';

  if (isPendulum && activeCard.desc && activeCard.desc.includes('[ Monster Effect ]')) {
    const parts = activeCard.desc.split('[ Monster Effect ]');
    pendulumEffect = parts[0].replace('[ Pendulum Effect ]', '').trim();
    monsterEffect = parts[1].trim();
  } else if (isPendulum && activeCard.desc && activeCard.desc.includes('----------------------------------------')) {
    const parts = activeCard.desc.split('----------------------------------------');
    pendulumEffect = parts[0].replace('[ Pendulum Effect ]', '').trim();
    monsterEffect = parts[1].replace('[ Monster Effect ]', '').trim();
  }

  const isMonster =
    activeCard.atk !== null ||
    activeCard.def !== null ||
    activeCard.level !== null ||
    activeCard.scale !== null ||
    activeCard.linkval !== null ||
    activeCard.type.toLowerCase().includes('monster');

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Floating Side Navigation Arrows for World-Class Ergonomics */}
      {onPrev && (
        <button
          onClick={e => {
            e.stopPropagation();
            onPrev();
          }}
          className="modal-side-nav modal-side-nav-left"
          title="Previous Card (ArrowLeft)"
          style={{
            position: 'fixed',
            left: 'calc(50% - 490px)',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10000,
            background: 'rgba(10, 15, 25, 0.9)',
            border: '1px solid var(--border-medium)',
            color: '#fff',
            width: 44,
            height: 64,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.15s ease',
          }}
        >
          ‹
        </button>
      )}

      {onNext && (
        <button
          onClick={e => {
            e.stopPropagation();
            onNext();
          }}
          className="modal-side-nav modal-side-nav-right"
          title="Next Card (ArrowRight)"
          style={{
            position: 'fixed',
            right: 'calc(50% - 490px)',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10000,
            background: 'rgba(10, 15, 25, 0.9)',
            border: '1px solid var(--border-medium)',
            color: '#fff',
            width: 44,
            height: 64,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.15s ease',
          }}
        >
          ›
        </button>
      )}

      <div
        className="modal-content glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 920,
          maxHeight: '94vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 16,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.08)',
          position: 'relative',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* Top Header Row with Navigation Ergonomics & Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 14,
          }}
        >
          {/* Card Sequence / Index Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {currentIndex !== undefined && totalCards !== undefined && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Card <strong>{currentIndex + 1}</strong> of <strong>{totalCards}</strong></span>
                {deckSection && (
                  <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>
                    • {deckSection}
                  </span>
                )}
              </span>
            )}

            {/* Quick Previous / Next buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={onPrev}
                disabled={!onPrev}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  opacity: onPrev ? 1 : 0.4,
                  cursor: onPrev ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Previous card (ArrowLeft)"
              >
                <span>← Prev</span>
                <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3, fontSize: '0.65rem' }}>
                  ←
                </kbd>
              </button>
              <button
                onClick={onNext}
                disabled={!onNext}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  opacity: onNext ? 1 : 0.4,
                  cursor: onNext ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Next card (ArrowRight)"
              >
                <span>Next →</span>
                <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3, fontSize: '0.65rem' }}>
                  →
                </kbd>
              </button>
            </div>
          </div>

          {/* Right Action buttons: Copy Link & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleCopyLink}
              className={`btn btn-sm ${copied ? 'btn-gold' : 'btn-secondary'}`}
              style={{
                fontSize: '0.75rem',
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Copy direct share link for this card (Press 'c')"
            >
              <span>{copied ? '✓ Link Copied!' : '📋 Copy Link'}</span>
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3, fontSize: '0.65rem' }}>
                C
              </kbd>
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Close modal (Escape)"
            >
              <span>Close</span>
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: '0.65rem' }}>
                Esc
              </kbd>
            </button>
          </div>
        </div>

        {/* Card Title & Full Classification Hierarchy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#fff', margin: 0, fontWeight: 800 }}>
              {activeCard.name}
            </h2>
            <span
              style={{
                background: badge.bg,
                border: `1px solid ${badge.border}`,
                color: badge.color,
                padding: '3px 10px',
                borderRadius: 6,
                fontWeight: 800,
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                boxShadow: `0 0 10px ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
            {activeCard.ban_tcg && (
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
                title="Status on standard TCG Advanced format banlist"
              >
                TCG: {activeCard.ban_tcg}
              </span>
            )}
          </div>

          {/* Subtitle / Attributes Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap', fontSize: '0.8rem' }}>
            {activeCard.attribute && (
              <span
                style={{
                  background: attrStyle.bg,
                  border: `1px solid ${attrStyle.border}`,
                  color: attrStyle.color,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: '0.725rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {activeCard.attribute}
              </span>
            )}

            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              {activeCard.humanReadableCardType || activeCard.type}
            </span>

            {activeCard.race && (
              <span style={{ color: 'var(--text-muted)' }}>
                • {activeCard.race}
              </span>
            )}

            {activeCard.archetype && (
              <span
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: 'var(--color-cyan)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.725rem',
                  fontWeight: 600,
                }}
              >
                Archetype: {activeCard.archetype}
              </span>
            )}
          </div>
        </div>

        {/* Content Body: Two columns on desktop */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {/* Left Column: Image and Alternate Artworks */}
          <div>
            <div
              style={{
                aspectRatio: '421 / 614',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#05070a',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-md), 0 8px 24px rgba(0,0,0,0.7)',
                position: 'relative',
              }}
            >
              {getProxiedImageUrl(currentImage.id || activeCard.id, 'small', currentImage.image_url || currentImage.image_url_small) ? (
                <img
                  src={getProxiedImageUrl(currentImage.id || activeCard.id, 'small', currentImage.image_url || currentImage.image_url_small)}
                  alt={activeCard.name}
                  loading="eager"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : null}
            </div>

            {/* Alternate Artworks Carousel/Selector */}
            {images.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600 }}>
                  ALTERNATE ARTWORKS ({images.length}):
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {images.map((img, idx) => {
                    const variantSrc = getProxiedImageUrl(img.id, 'cropped', img.image_url_cropped || img.image_url_small);
                    return variantSrc ? (
                      <img
                        key={img.id || idx}
                        src={variantSrc}
                        alt={`Variant ${idx + 1}`}
                        onClick={() => setSelectedImageIndex(idx)}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 6,
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: selectedImageIndex === idx ? '2px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                          boxShadow: selectedImageIndex === idx ? '0 0 8px var(--color-cyan)' : 'none',
                        }}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Point Value Callout, Monster Stats, Description & Attribution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Official Point Value Callout Box */}
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: `1px solid ${badge.border}`,
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 700 }}>
                OFFICIAL GENESYS POINT VALUE
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: badge.color }}>
                  {activeCard.points || 0}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  POINTS
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                  {badge.category}
                </div>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                {activeCard.points === 0
                  ? 'All unlisted standard cards are 0 points and completely unrestricted within the 100-point deck budget.'
                  : `Official point cost published by Konami. Consumes ${activeCard.points}% of your total 100-point tournament wallet.`}
              </p>
            </div>

            {/* Monster Stats Grid */}
            {isMonster && (activeCard.atk !== null || activeCard.def !== null || activeCard.level !== null || activeCard.scale !== null || activeCard.linkval !== null) && (
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '10px 14px',
                  background: 'var(--bg-surface-raised)',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                }}
              >
                {activeCard.level !== null && (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>★ LEVEL: </span>
                    <strong style={{ color: 'var(--color-gold-light)' }}>{activeCard.level}</strong>
                  </div>
                )}
                {activeCard.scale !== null && (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>SCALE: </span>
                    <strong style={{ color: 'var(--color-cyan)' }}>{activeCard.scale}</strong>
                  </div>
                )}
                {activeCard.linkval !== null && (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>LINK: </span>
                    <strong style={{ color: 'var(--color-cyan)' }}>{activeCard.linkval}</strong>
                  </div>
                )}
                {activeCard.atk !== null && (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>ATK: </span>
                    <strong style={{ color: '#fff' }}>{activeCard.atk}</strong>
                  </div>
                )}
                {activeCard.def !== null && (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>DEF: </span>
                    <strong style={{ color: '#fff' }}>{activeCard.def}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Card Description & Effects */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  CARD TEXT & EFFECTS
                </span>
                {isEnriching && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-cyan)' }} />
                    Loading official text...
                  </span>
                )}
              </div>

              {/* Shimmer loading skeleton if effect is still enriching */}
              {isEnriching && !activeCard.desc ? (
                <div
                  style={{
                    padding: 16,
                    background: 'var(--bg-surface-raised)',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ height: 12, width: '90%', background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                  <div style={{ height: 12, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                  <div style={{ height: 12, width: '75%', background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                </div>
              ) : isPendulum && pendulumEffect ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Pendulum Effect Block */}
                  <div
                    style={{
                      padding: 12,
                      background: 'rgba(0, 240, 255, 0.04)',
                      borderRadius: 8,
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      fontSize: '0.825rem',
                      lineHeight: 1.55,
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    <div style={{ fontSize: '0.675rem', color: 'var(--color-cyan)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                      [ Pendulum Effect • Scale {activeCard.scale ?? '—'} ]
                    </div>
                    {pendulumEffect}
                  </div>

                  {/* Monster Effect Block */}
                  <div
                    style={{
                      padding: 12,
                      background: 'var(--bg-surface-raised)',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.825rem',
                      lineHeight: 1.55,
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-line',
                      maxHeight: 160,
                      overflowY: 'auto',
                    }}
                  >
                    <div style={{ fontSize: '0.675rem', color: 'var(--color-gold-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                      [ Monster Effect ]
                    </div>
                    {monsterEffect}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: 14,
                    background: 'var(--bg-surface-raised)',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.835rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-line',
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {activeCard.desc || 'No card description available.'}
                </div>
              )}
            </div>

            {/* Featured Tournament Decks using this card */}
            {featuredTournamentDecks.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gold-light)', fontWeight: 800, marginBottom: 6, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🏆 FEATURED IN {featuredTournamentDecks.length} TOURNAMENT TOP-CUT DECKS:</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 85, overflowY: 'auto' }}>
                  {featuredTournamentDecks.slice(0, 8).map(({ deck, tournament, count, section }) => (
                    <Link
                      key={`${tournament.id}-${deck.id}`}
                      href={`/tournaments/${tournament.id}/decks/${deck.id}`}
                      style={{
                        textDecoration: 'none',
                        fontSize: '0.725rem',
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: deck.rank === 1 ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-raised)',
                        border: deck.rank === 1 ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-subtle)',
                        color: deck.rank === 1 ? 'var(--color-gold-light)' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.15s ease',
                      }}
                      title={`View ${deck.name}'s decklist (${count}x in ${section})`}
                    >
                      <span>{deck.rank === 1 ? '🏆' : `#${deck.rank}`}</span>
                      <strong>{deck.name}</strong>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.675rem' }}>({count}x {section})</span>
                    </Link>
                  ))}
                  {featuredTournamentDecks.length > 8 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                      +{featuredTournamentDecks.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Links and Attributions */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 10,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                  href="https://www.yugioh-card.com/en/genesys/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', fontSize: '0.75rem' }}
                >
                  🔗 Official Genesys Site ↗
                </a>
                <a
                  href={`https://ygoprodeck.com/card/?search=${encodeURIComponent(activeCard.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', fontSize: '0.75rem' }}
                >
                  🃏 YGOPRODeck Database ↗
                </a>
              </div>

              <Link
                href={`/card/${activeCard.id}`}
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none', fontSize: '0.75rem' }}
              >
                Standalone URL →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
