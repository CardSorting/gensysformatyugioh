'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/types/card';
import { CardDetailModal } from './CardDetailModal';
import { RulesModal } from './RulesModal';
import { getProxiedImageUrl } from '@/lib/images';

interface CardGalleryProps {
  initialCards?: Card[];
  initialTotal?: number;
}

interface PointDistribution {
  total: number;
  pointBearing: number;
  p100: number;
  p50to99: number;
  p25to49: number;
  p10to24: number;
  p1to9: number;
  p0: number;
}

const DEFAULT_DISTRIBUTION: PointDistribution = {
  total: 1252,
  pointBearing: 750,
  p100: 105,
  p50to99: 75,
  p25to49: 76,
  p10to24: 241,
  p1to9: 253,
  p0: 502,
};

export function CardGallery({ initialCards = [], initialTotal = 0 }: CardGalleryProps) {
  const searchParams = useSearchParams();

  // Read initial states from URL query parameters if present
  const initialQ = searchParams?.get('q') || '';
  const initialPoints = searchParams?.get('points') || 'point-bearing';
  const initialMinPoints = searchParams?.get('minPoints') || '';
  const initialMaxPoints = searchParams?.get('maxPoints') || '';
  const initialType = searchParams?.get('type') || '';
  const initialSort = searchParams?.get('sort') || 'points-desc';
  const initialView = (searchParams?.get('view') === 'table' ? 'table' : 'grid') as 'grid' | 'table';

  const [cards, setCards] = useState<Card[]>(initialCards);
  const [total, setTotal] = useState<number>(initialTotal);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const limit = 48;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>(initialQ);
  const [pointRange, setPointRange] = useState<string>(initialPoints);
  const [minPoints, setMinPoints] = useState<string>(initialMinPoints);
  const [maxPoints, setMaxPoints] = useState<string>(initialMaxPoints);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [sort, setSort] = useState<string>(initialSort);
  const [showCustomRange, setShowCustomRange] = useState<boolean>(Boolean(initialMinPoints || initialMaxPoints));

  // View Mode: 'grid' (visual cards) vs 'table' (high density spreadsheet)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(initialView);

  // Distribution counts for filter badges
  const [distribution, setDistribution] = useState<PointDistribution>(DEFAULT_DISTRIBUTION);

  // Modal inspection
  const [inspectCard, setInspectCard] = useState<Card | null>(null);

  // Rules explainer modal
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Copy share view toast
  const [shareToast, setShareToast] = useState<boolean>(false);

  // Scroll to top visibility
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Track scroll position for Back-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global keyboard shortcut: pressing "/" focuses search input, Esc clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !inspectCard && !showRulesModal) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectCard, showRulesModal]);

  const isUrlSyncMounted = useRef(false);

  // Synchronize state with URL query parameters for bookmarking & sharing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isUrlSyncMounted.current) {
      isUrlSyncMounted.current = true;
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (pointRange && pointRange !== 'point-bearing') params.set('points', pointRange);
    if (showCustomRange) {
      if (minPoints !== '') params.set('minPoints', minPoints);
      if (maxPoints !== '') params.set('maxPoints', maxPoints);
    }
    if (selectedType) params.set('type', selectedType);
    if (sort !== 'points-desc') params.set('sort', sort);
    if (viewMode !== 'grid') params.set('view', viewMode);

    const queryString = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, '');

    // Strict guard: if the URL query string already matches our state, do nothing
    if (currentSearch === queryString) {
      return;
    }

    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Use replaceState to keep browser history clean without full page reload
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, pointRange, minPoints, maxPoints, selectedType, sort, showCustomRange, viewMode]);

  // Core Card Fetching Function
  // targetOffset is passed explicitly to eliminate state-closure race conditions!
  const fetchCards = useCallback(
    async (targetOffset: number, append: boolean) => {
      setLoading(true);

      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(targetOffset),
        sort,
      });

      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedType) params.set('type', selectedType);

      if (showCustomRange) {
        if (minPoints !== '') params.set('minPoints', minPoints);
        if (maxPoints !== '') params.set('maxPoints', maxPoints);
      } else if (pointRange) {
        params.set('pointRange', pointRange);
      }

      try {
        const res = await fetch(`/api/cards?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const incomingCards: Card[] = json.cards || [];

          if (append) {
            // Strict ID deduplication prevents any duplicate React keys
            setCards(prev => {
              const seenIds = new Set(prev.map(c => c.id));
              const uniqueNew = incomingCards.filter(c => !seenIds.has(c.id));
              return [...prev, ...uniqueNew];
            });
          } else {
            setCards(incomingCards);
          }

          setTotal(json.total || 0);

          if (json.distribution) {
            setDistribution(json.distribution);
          }
        }
      } catch (err) {
        console.error('Failed to load cards:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedType, pointRange, showCustomRange, minPoints, maxPoints, sort]
  );

  // Fetch when filters change (with debounce)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const isDefaultView =
        !initialQ &&
        !initialType &&
        (initialPoints === 'point-bearing' || !initialPoints) &&
        !initialMinPoints &&
        !initialMaxPoints &&
        initialSort === 'points-desc';

      if (isDefaultView && initialCards.length > 0) {
        return;
      }
    }

    const timer = setTimeout(() => {
      setOffset(0);
      fetchCards(0, false);
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, pointRange, showCustomRange, minPoints, maxPoints, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle "Load More" pagination safely
  const handleLoadMore = () => {
    if (loading || cards.length >= total) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchCards(nextOffset, true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPointRange('point-bearing');
    setMinPoints('');
    setMaxPoints('');
    setSelectedType('');
    setSort('points-desc');
    setShowCustomRange(false);
  };

  const handleShareView = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2400);
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modal Next/Prev navigation
  const currentInspectIndex = inspectCard ? cards.findIndex(c => c.id === inspectCard.id) : -1;
  const handleNextCard = () => {
    if (currentInspectIndex >= 0 && currentInspectIndex < cards.length - 1) {
      setInspectCard(cards[currentInspectIndex + 1]);
    }
  };
  const handlePrevCard = () => {
    if (currentInspectIndex > 0) {
      setInspectCard(cards[currentInspectIndex - 1]);
    }
  };

  const getPointBadgeStyle = (points: number) => {
    if (points >= 50) {
      return {
        bg: 'rgba(239, 68, 68, 0.2)',
        border: 'rgba(239, 68, 68, 0.6)',
        color: '#f87171',
        text: `${points} PTS`,
      };
    }
    if (points >= 15) {
      return {
        bg: 'rgba(245, 158, 11, 0.2)',
        border: 'rgba(245, 158, 11, 0.6)',
        color: '#fbbf24',
        text: `${points} PTS`,
      };
    }
    if (points > 0) {
      return {
        bg: 'rgba(6, 182, 212, 0.2)',
        border: 'rgba(6, 182, 212, 0.6)',
        color: '#38bdf8',
        text: `${points} PTS`,
      };
    }
    return {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.4)',
      color: '#34d399',
      text: '0 PTS',
    };
  };

  // Filter preset buttons with live count indicators
  const pointPresets = [
    { id: 'point-bearing', label: `⭐ Official List (${distribution.pointBearing})`, count: distribution.pointBearing },
    { id: '100', label: `100 pts (${distribution.p100})`, count: distribution.p100 },
    { id: '50-99', label: `50–99 pts (${distribution.p50to99})`, count: distribution.p50to99 },
    { id: '25-49', label: `25–49 pts (${distribution.p25to49})`, count: distribution.p25to49 },
    { id: '10-24', label: `10–24 pts (${distribution.p10to24})`, count: distribution.p10to24 },
    { id: '1-9', label: `1–9 pts (${distribution.p1to9})`, count: distribution.p1to9 },
    { id: '0', label: `0 pts (${distribution.p0})`, count: distribution.p0 },
    { id: 'all', label: `All Cards (${distribution.total})`, count: distribution.total },
  ];

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedType ||
    pointRange !== 'point-bearing' ||
    minPoints ||
    maxPoints
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px', width: '100%', flex: 1, position: 'relative' }}>
      {/* Sticky Glassmorphic Search & Filter Control Bar */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          margin: '16px 0',
          position: 'sticky',
          top: 10,
          zIndex: 40,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Row 1: Search Bar, Type Selector, Sort, View Switcher & Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
                fontSize: '0.9rem',
              }}
            >
              🔍
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search card name, archetype, or effect... (Press /)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                padding: '9px 36px 9px 34px',
                color: '#fff',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              color: '#fff',
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: '0.825rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">All Card Types</option>
            <option value="monster">Monsters (All)</option>
            <option value="spell">Spell Cards</option>
            <option value="trap">Trap Cards</option>
            <option value="extra">Extra Deck (Fusion/Synchro/Xyz)</option>
            <option value="fusion">Fusion Monsters</option>
            <option value="synchro">Synchro Monsters</option>
            <option value="xyz">Xyz Monsters</option>
            <option value="ritual">Ritual Monsters</option>
            <option value="link">Link Monsters (Banned in Genesys)</option>
            <option value="pendulum">Pendulum Monsters (Banned in Genesys)</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              color: '#fff',
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: '0.825rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="points-desc">Points: High to Low (100 → 0)</option>
            <option value="points-asc">Points: Low to High (0 → 100)</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="atk-desc">ATK: High to Low</option>
          </select>

          {/* View Mode Toggle: Grid vs Compact Table */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-primary)',
              borderRadius: 8,
              border: '1px solid var(--border-medium)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--bg-surface-raised)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-cyan)' : 'var(--text-dim)',
                border: 'none',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Visual Grid View"
            >
              <span>⊞</span>
              <span style={{ display: 'none', smInline: 'inline' } as React.CSSProperties}>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--bg-surface-raised)' : 'transparent',
                color: viewMode === 'table' ? 'var(--color-cyan)' : 'var(--text-dim)',
                border: 'none',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Compact Table / Spreadsheet View"
            >
              <span>☰</span>
              <span style={{ display: 'none', smInline: 'inline' } as React.CSSProperties}>Table</span>
            </button>
          </div>

          {/* Custom Points Toggle */}
          <button
            onClick={() => setShowCustomRange(!showCustomRange)}
            className={`btn btn-sm ${showCustomRange ? 'btn-gold' : 'btn-secondary'}`}
            style={{ padding: '8px 12px' }}
          >
            {showCustomRange ? '✕ Close Range' : '⚙️ Custom Range'}
          </button>

          {/* Genesys Rules Quick Info Button */}
          <button
            onClick={() => setShowRulesModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 12px', color: 'var(--color-gold-light)' }}
            title="View official Genesys format rules"
          >
            ℹ️ Rules
          </button>

          {/* Share View URL Button */}
          <button
            onClick={handleShareView}
            className={`btn btn-sm ${shareToast ? 'btn-gold' : 'btn-secondary'}`}
            style={{ padding: '8px 12px' }}
            title="Copy shareable link with your current filters"
          >
            {shareToast ? '✓ Link Copied!' : '🔗 Share View'}
          </button>
        </div>

        {/* Row 2: Point Value Preset Chips */}
        {!showCustomRange ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-dim)', marginRight: 2 }}>
              FILTER BY POINTS:
            </span>
            {pointPresets.map(preset => {
              const isSelected = pointRange === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setPointRange(preset.id)}
                  style={{
                    background: isSelected ? 'var(--color-cyan)' : 'var(--bg-surface-raised)',
                    color: isSelected ? '#07090e' : 'var(--text-main)',
                    border: `1px solid ${isSelected ? 'var(--color-cyan)' : 'var(--border-subtle)'}`,
                    padding: '4px 10px',
                    borderRadius: 16,
                    fontSize: '0.725rem',
                    fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        ) : (
          /* Custom Min/Max Inputs */
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface-raised)',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gold-light)' }}>
              Custom Point Range:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Min:</span>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={minPoints}
                onChange={e => setMinPoints(e.target.value)}
                style={{
                  width: 65,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Max:</span>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={maxPoints}
                onChange={e => setMaxPoints(e.target.value)}
                style={{
                  width: 65,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                }}
              />
            </div>
            {(minPoints !== '' || maxPoints !== '') && (
              <button
                onClick={() => {
                  setMinPoints('');
                  setMaxPoints('');
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.725rem', padding: '2px 8px' }}
              >
                Clear Range
              </button>
            )}
          </div>
        )}

        {/* Row 3: Results Counter & Active Filter Indicators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '0.8rem' }}>
          <div style={{ color: 'var(--text-dim)' }}>
            Showing <strong>{cards.length}</strong> of <strong>{total}</strong> cards matching criteria
            {pointRange === 'point-bearing' && !showCustomRange && (
              <span style={{ color: 'var(--color-gold-light)', marginLeft: 6 }}>
                (Official Point-Bearing Cards)
              </span>
            )}
            {loading && <span style={{ marginLeft: 8, color: 'var(--color-cyan)' }}>⏳ Refreshing...</span>}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-red)',
                cursor: 'pointer',
                fontSize: '0.775rem',
                fontWeight: 600,
                padding: 0,
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Row 4: Dismissible Active Filter Chips */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700 }}>
              ACTIVE:
            </span>

            {searchQuery && (
              <span
                onClick={() => setSearchQuery('')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  color: 'var(--color-cyan)',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Click to remove search filter"
              >
                <span>🔍 &ldquo;{searchQuery}&rdquo;</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✕</span>
              </span>
            )}

            {pointRange && pointRange !== 'point-bearing' && !showCustomRange && (
              <span
                onClick={() => setPointRange('point-bearing')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: 'var(--color-gold-light)',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Click to reset point range"
              >
                <span>⚡ {pointRange} pts</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✕</span>
              </span>
            )}

            {selectedType && (
              <span
                onClick={() => setSelectedType('')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#c084fc',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Click to remove card type filter"
              >
                <span>🃏 {selectedType}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✕</span>
              </span>
            )}

            {(minPoints !== '' || maxPoints !== '') && (
              <span
                onClick={() => {
                  setMinPoints('');
                  setMaxPoints('');
                  setShowCustomRange(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Click to reset custom point boundaries"
              >
                <span>⚙️ {minPoints || 0}–{maxPoints || 100} pts</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✕</span>
              </span>
            )}

            {sort !== 'points-desc' && (
              <span
                onClick={() => setSort('points-desc')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Click to reset sort order"
              >
                <span>🔀 {sort}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✕</span>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-red)',
                cursor: 'pointer',
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '2px 6px',
                marginLeft: 'auto',
              }}
            >
              ✕ Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading && cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>Loading Genesys Point List...</h3>
        </div>
      ) : cards.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '60px 16px',
            color: 'var(--text-muted)',
            margin: '20px 0',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔎</div>
          <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>No cards found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: 460, margin: '0 auto 16px auto' }}>
            No cards matched your search query or point filter. Try adjusting the search term or switching to &quot;All Cards&quot;.
          </p>
          <button onClick={handleClearFilters} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Visual Card Grid View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {cards.map((card, idx) => {
            const badge = getPointBadgeStyle(card.points || 0);
            const imageSrc = getProxiedImageUrl(
              card.id,
              'small',
              card.images && card.images[0]
                ? card.images[0].image_url_small || card.images[0].image_url
                : undefined
            );

            // Unique key guaranteed via card.id and verified deduplication
            return (
              <div
                key={card.id}
                onClick={() => setInspectCard(card)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = badge.border;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {/* Official Point Value Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    zIndex: 2,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    padding: '2px 7px',
                    borderRadius: 6,
                    fontSize: '0.725rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    backdropFilter: 'blur(6px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  {badge.text}
                </div>

                {/* Card Artwork */}
                <div
                  style={{
                    aspectRatio: '421 / 614',
                    background: '#040608',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  { }
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={card.name}
                      loading={idx < 24 ? 'eager' : 'lazy'}
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                      🃏
                    </div>
                  )}
                </div>

                {/* Card Name and Metadata Footer */}
                <div
                  style={{
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'var(--bg-surface-raised)',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: '#fff',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={card.name}
                  >
                    {card.name}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.675rem',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.humanReadableCardType || card.type}
                    </span>
                    <span style={{ color: badge.color, fontWeight: 700, fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
                      {card.points || 0}p
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table / Spreadsheet View (High-density power-user mode) */
        <div
          className="glass-panel"
          style={{
            overflowX: 'auto',
            marginBottom: 28,
            borderRadius: 10,
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'var(--bg-surface-raised)',
                  borderBottom: '1px solid var(--border-medium)',
                  color: 'var(--text-dim)',
                  fontSize: '0.725rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '10px 14px', width: 48 }}>Art</th>
                <th style={{ padding: '10px 14px' }}>Card Name</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', width: 90 }}>Points</th>
                <th style={{ padding: '10px 14px' }}>Type</th>
                <th style={{ padding: '10px 14px' }}>Attribute / Level</th>
                <th style={{ padding: '10px 14px' }}>ATK / DEF</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, idx) => {
                const badge = getPointBadgeStyle(card.points || 0);
                const thumbSrc = getProxiedImageUrl(
                  card.id,
                  'cropped',
                  card.images && card.images[0]
                    ? card.images[0].image_url_cropped || card.images[0].image_url_small
                    : undefined
                );

                return (
                  <tr
                    key={card.id}
                    onClick={() => setInspectCard(card)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)';
                    }}
                  >
                    {/* Thumbnail */}
                    <td style={{ padding: '8px 14px' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 4,
                          overflow: 'hidden',
                          background: '#05070a',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        { }
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={card.name}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : null}
                      </div>
                    </td>

                    {/* Card Name */}
                    <td style={{ padding: '8px 14px', fontWeight: 700, color: '#fff' }}>
                      <div>{card.name}</div>
                      {card.archetype && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                          {card.archetype}
                        </div>
                      )}
                    </td>

                    {/* Points Badge */}
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      <span
                        style={{
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-block',
                          minWidth: 54,
                        }}
                      >
                        {card.points || 0} pts
                      </span>
                    </td>

                    {/* Card Type */}
                    <td style={{ padding: '8px 14px', color: 'var(--text-muted)' }}>
                      {card.humanReadableCardType || card.type}
                    </td>

                    {/* Attribute & Level */}
                    <td style={{ padding: '8px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {card.attribute && <span style={{ marginRight: 6 }}>{card.attribute}</span>}
                      {card.level !== null && (
                        <span style={{ color: 'var(--color-gold-light)' }}>★{card.level}</span>
                      )}
                      {card.scale !== null && (
                        <span style={{ color: 'var(--color-cyan)', marginLeft: 6 }}>S:{card.scale}</span>
                      )}
                    </td>

                    {/* ATK / DEF */}
                    <td style={{ padding: '8px 14px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      {card.atk !== null ? `${card.atk} / ${card.def ?? '-'}` : '-'}
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.725rem', padding: '3px 8px' }}
                        onClick={e => {
                          e.stopPropagation();
                          setInspectCard(card);
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination / Load More Button */}
      {cards.length < total && (
        <div style={{ textAlign: 'center', margin: '24px 0 40px 0' }}>
          <button
            className="btn btn-secondary"
            onClick={handleLoadMore}
            disabled={loading}
            style={{ minWidth: 280, padding: '10px 24px', fontSize: '0.85rem' }}
          >
            {loading ? 'Loading cards...' : `Load More (${total - cards.length} remaining)`}
          </button>
        </div>
      )}

      {/* Floating Back to Top Action */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="btn btn-secondary btn-sm"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 60,
            boxShadow: 'var(--shadow-md)',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-medium)',
            padding: '8px 14px',
            fontSize: '0.8rem',
          }}
          title="Scroll back to top"
        >
          ↑ Top
        </button>
      )}

      {/* Inspection Modal with Carousel Cycling & Keyboard Ergonomics */}
      {inspectCard && (
        <CardDetailModal
          key={inspectCard.id}
          card={inspectCard}
          onClose={() => setInspectCard(null)}
          onNext={currentInspectIndex < cards.length - 1 ? handleNextCard : undefined}
          onPrev={currentInspectIndex > 0 ? handlePrevCard : undefined}
          currentIndex={currentInspectIndex}
          totalCards={cards.length}
        />
      )}

      {/* Genesys Official Format Rules Modal */}
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
    </div>
  );
}
