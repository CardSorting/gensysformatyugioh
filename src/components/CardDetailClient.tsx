'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardImage } from '@/types/card';
import cardsRaw from '@/data/cards.json';
import { getProxiedImageUrl } from '@/lib/images';
import { getDecksFeaturingCard } from '@/lib/tournaments';

const localCards: Card[] = cardsRaw as Card[];

function CardDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const cardIdNum = parseInt(id, 10);
  const localFound = localCards.find(c => c.id === cardIdNum) || null;

  const [card, setCard] = useState<Card | null>(localFound);
  const [loading, setLoading] = useState<boolean>(!localFound);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (card) return;

    const controller = new AbortController();
    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}&format=genesys&misc=yes`, {
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`YGOPRODeck API error (${r.status})`);
        return r.json();
      })
      .then(d => {
        if (d.data && d.data[0]) {
          const raw = d.data[0];
          const fetched: Card = {
            id: raw.id,
            name: raw.name,
            type: raw.type,
            frameType: raw.frameType,
            humanReadableCardType: raw.humanReadableCardType,
            desc: raw.desc,
            race: raw.race,
            archetype: raw.archetype || null,
            attribute: raw.attribute || null,
            atk: typeof raw.atk === 'number' ? raw.atk : null,
            def: typeof raw.def === 'number' ? raw.def : null,
            level: typeof raw.level === 'number' ? raw.level : null,
            scale: typeof raw.scale === 'number' ? raw.scale : null,
            linkval: typeof raw.linkval === 'number' ? raw.linkval : null,
            points: Number(raw.misc_info?.[0]?.genesys_points || 0),
            ban_tcg: raw.banlist_info?.ban_tcg || null,
            images: (raw.card_images || []).map((img: CardImage) => ({
              id: img.id,
              image_url: img.image_url,
              image_url_small: img.image_url_small,
              image_url_cropped: img.image_url_cropped,
            })),
          };
          setCard(fetched);
        } else {
          setFetchError(`Card #${id} not found in official Genesys data.`);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setFetchError(`Failed to load card #${id}: ${err.message}`);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id, card]);

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  const featuredTournamentDecks = useMemo(() => {
    if (!card) return [];
    return getDecksFeaturingCard(card.id, card.name);
  }, [card]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🃏</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>Loading Official Card Data...</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 6 }}>
          Querying official Genesys point value and YGOPRODeck images...
        </p>
      </div>
    );
  }

  if (fetchError || !card) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: 40 }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: '#fff', margin: 0 }}>Card Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8 }}>
            {fetchError || `Card #${id} could not be resolved from official Genesys sources.`}
          </p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 20 }}>
            ← Return to Genesys Point Visualizer
          </Link>
        </div>
      </div>
    );
  }

  const images: CardImage[] =
    card.images && card.images.length > 0
      ? card.images
      : [
          {
            id: card.id,
            image_url: `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
            image_url_small: `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`,
            image_url_cropped: `https://images.ygoprodeck.com/images/cards_cropped/${card.id}.jpg`,
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
        category: 'High Point Investment',
      };
    }
    if (points >= 15) {
      return {
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.5)',
        color: '#fbbf24',
        label: `${points} Points`,
        category: 'Moderate Point Investment',
      };
    }
    if (points > 0) {
      return {
        bg: 'rgba(6, 182, 212, 0.15)',
        border: 'rgba(6, 182, 212, 0.5)',
        color: '#38bdf8',
        label: `${points} Points`,
        category: 'Low Point Investment',
      };
    }
    return {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      color: '#34d399',
      label: '0 Points (Unlisted / Free)',
      category: 'Standard Card',
    };
  };

  const badge = getPointBadgeStyle(card.points || 0);

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 16px', width: '100%', flex: 1 }}>
      {/* Top Breadcrumb & Return Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ color: 'var(--text-dim)' }}>›</span>
          <Link href="/" style={{ color: 'var(--color-cyan)', textDecoration: 'none', fontWeight: 600 }}>
            Genesys Point List
          </Link>
          <span style={{ color: 'var(--text-dim)' }}>›</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{card.name}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2400);
              }
            }}
            className={`btn btn-sm ${copied ? 'btn-gold' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            {copied ? '✓ Link Copied!' : '📋 Copy Link'}
          </button>

          <button
            onClick={handleBack}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>Return to Gallery</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: '0.65rem' }}>
              Esc
            </kbd>
          </button>
        </div>
      </div>

      {/* Main Card View */}
      <div
        className="glass-panel"
        style={{
          padding: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
        }}
      >
        {/* Left Column: Artwork & Alternate Arts */}
        <div>
          <div
            style={{
              aspectRatio: '421 / 614',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: `1px solid ${badge.border}`,
              background: '#05070a',
              position: 'relative',
            }}
          >
            {getProxiedImageUrl(currentImage.id || card.id, 'small', currentImage.image_url || currentImage.image_url_small) ? (
              <img
                src={getProxiedImageUrl(currentImage.id || card.id, 'small', currentImage.image_url || currentImage.image_url_small)}
                alt={card.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : null}
          </div>

          {images.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                ALTERNATE ARTWORKS ({images.length}):
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                {images.map((img, idx) => {
                  const variantSrc = getProxiedImageUrl(img.id, 'cropped', img.image_url_cropped || img.image_url_small);
                  return variantSrc ? (
                    <img
                      key={img.id || idx}
                      src={variantSrc}
                      alt={`Variant ${idx + 1}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 6,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedImageIndex === idx ? '2px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                        boxShadow: selectedImageIndex === idx ? '0 0 10px var(--color-cyan)' : 'none',
                      }}
                    />
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Card Details & Point Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card Title & Type */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', margin: 0 }}>
                {card.name}
              </h1>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {card.humanReadableCardType || card.type} {card.race ? `• ${card.race}` : ''}{' '}
              {card.attribute ? `• ${card.attribute}` : ''}
              {card.archetype ? ` • Archetype: ${card.archetype}` : ''}
            </div>
          </div>

          {/* Official Point Value Callout Box */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              background: 'var(--bg-surface-raised)',
              border: `1px solid ${badge.border}`,
            }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 700 }}>
              OFFICIAL GENESYS POINT VALUE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: badge.color }}>
                {card.points || 0}
              </div>
              <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>
                POINTS
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {badge.category}
              </div>
            </div>

            {/* Point Budget Gauge */}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-dim)', marginBottom: 4 }}>
                <span>Budget Consumption per copy:</span>
                <strong style={{ color: badge.color }}>{card.points || 0} / 100 PTS ({card.points || 0}%)</strong>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, card.points || 0))}%`,
                    background: (card.points || 0) >= 50 ? 'var(--color-red)' : (card.points || 0) >= 15 ? 'var(--color-gold)' : 'var(--color-cyan)',
                    boxShadow: `0 0 10px ${badge.border}`,
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
              Official Konami Genesys format point assignment. Deck capacity is strictly capped at 100 total points.
            </p>
          </div>

          {/* Monster Stats */}
          {(card.atk !== null || card.def !== null || card.level !== null || card.scale !== null || card.linkval !== null) && (
            <div
              style={{
                display: 'flex',
                gap: 20,
                padding: '10px 16px',
                background: 'var(--bg-surface-raised)',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
              }}
            >
              {card.level !== null && (
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>★ LEVEL: </span>
                  <strong style={{ color: 'var(--color-gold-light)' }}>{card.level}</strong>
                </div>
              )}
              {card.scale !== null && (
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>SCALE: </span>
                  <strong style={{ color: 'var(--color-cyan)' }}>{card.scale}</strong>
                </div>
              )}
              {card.linkval !== null && (
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>LINK: </span>
                  <strong style={{ color: 'var(--color-cyan)' }}>{card.linkval}</strong>
                </div>
              )}
              {card.atk !== null && (
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>ATK: </span>
                  <strong style={{ color: '#fff' }}>{card.atk}</strong>
                </div>
              )}
              {card.def !== null && (
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>DEF: </span>
                  <strong style={{ color: '#fff' }}>{card.def}</strong>
                </div>
              )}
            </div>
          )}

          {/* Description Text */}
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
              CARD TEXT
            </div>
            <div
              style={{
                padding: '16px 18px',
                background: 'var(--bg-surface-raised)',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                whiteSpace: 'pre-line',
              }}
            >
              {card.desc}
            </div>
          </div>

          {/* Featured Tournament Decks using this card */}
          {featuredTournamentDecks.length > 0 && (
            <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 10, padding: 16, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gold-light)', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🏆 FEATURED IN {featuredTournamentDecks.length} TOURNAMENT TOP-CUT DECKS:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 8 }}>
                {featuredTournamentDecks.map(({ deck, tournament, count, section }) => (
                  <Link
                    key={`${tournament.id}-${deck.id}`}
                    href={`/tournaments/${tournament.id}/decks/${deck.id}`}
                    style={{
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: deck.rank === 1 ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)',
                      border: deck.rank === 1 ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-subtle)',
                      color: deck.rank === 1 ? 'var(--color-gold-light)' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      transition: 'all 0.15s ease',
                    }}
                    title={`View ${deck.name}'s decklist (${count}x in ${section})`}
                  >
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {deck.rank === 1 ? '🏆 ' : `#${deck.rank} `}{deck.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {deck.archetype} • {tournament.shortTitle}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--color-cyan)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {count}x {section}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Source Attribution and External Links */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://www.yugioh-card.com/en/genesys/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              🔗 Official Konami Genesys Site ↗
            </a>
            <a
              href={`https://ygoprodeck.com/card/?search=${encodeURIComponent(card.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              🃏 View on YGOPRODeck ↗
            </a>
            <Link href="/" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
              ← Return to Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CardDetailClient({ id }: { id: string }) {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🃏</div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>Loading Official Card Data...</h2>
        </div>
      }
    >
      <CardDetailContent id={id} />
    </Suspense>
  );
}

