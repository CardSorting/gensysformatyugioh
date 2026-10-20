import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CardGallery } from '@/components/CardGallery';
import cardsRaw from '@/data/cards.json';
import { Card } from '@/types/card';

export const metadata: Metadata = {
  title: 'Genesys Point List & Card Gallery — Official Yu-Gi-Oh! Point Values',
  description:
    'Browse, search, and filter the official Yu-Gi-Oh! Genesys format card point list. Filter by point ranges (100 pts, 50-99, 25-49, 1-24, and 0 pts), card types, and high-resolution artwork.',
};

const localCards: Card[] = cardsRaw as Card[];

export default function CardsPage() {
  // Pre-filter point-bearing cards for initial server render
  const initialPointCards = localCards
    .filter(c => (c.points || 0) > 0)
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 48);

  const totalPointBearing = localCards.filter(c => (c.points || 0) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 40 }}>
      {/* Header Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.08) 0%, rgba(7, 9, 14, 0) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '28px 16px 20px 16px',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              marginBottom: 14,
            }}
          >
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Home
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Point List Visualizer</span>
          </nav>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              {/* Badge row */}
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
                  OFFICIAL POINT LIST
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.725rem',
                    padding: '3px 9px',
                    borderRadius: 12,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--color-gold-light)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    fontWeight: 700,
                  }}
                >
                  {totalPointBearing} POINT-BEARING CARDS
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.725rem',
                    padding: '3px 9px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    fontWeight: 700,
                  }}
                >
                  100-POINT BUDGET CAP
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                  color: '#fff',
                  margin: '0 0 8px 0',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                }}
              >
                YU-GI-OH! GENESYS POINT LIST VISUALIZER
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 840, lineHeight: 1.5, margin: 0 }}>
                Visual companion to Konami&apos;s official Genesys format. Browse official card point costs, inspect artwork, filter by point brackets, and search across the entire registered pool with instant client-side responsiveness.
              </p>
            </div>

            {/* Format Rules Quick Callout */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'var(--bg-surface)',
                padding: 14,
                borderRadius: 10,
                border: '1px solid var(--border-medium)',
                minWidth: 260,
              }}
            >
              <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                FORMAT GUIDELINES:
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                100 pt total deck cap • Link &amp; Pendulum banned • Unlisted cards cost 0 pts
              </div>
              <a
                href="https://www.yugioh-card.com/en/genesys/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-cyan)',
                  textDecoration: 'none',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <span>Konami Official Genesys Source</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Gallery Area */}
      <Suspense
        fallback={
          <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>Loading Genesys Point Gallery...</h3>
            <p>Fetching official card point values from local database...</p>
          </div>
        }
      >
        <CardGallery initialCards={initialPointCards} initialTotal={totalPointBearing} />
      </Suspense>
    </div>
  );
}
