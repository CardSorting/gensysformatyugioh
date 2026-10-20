import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'GENESYS POINT LIST VISUALIZER — Official Yu-Gi-Oh! Genesys Card Gallery',
  description:
    'A lightweight, visually polished companion webapp for the official Yu-Gi-Oh! Genesys format. Browse, search, filter, and inspect official card point values and high-res artwork.',
  keywords: [
    'Yu-Gi-Oh',
    'Genesys',
    'Genesys Format',
    'Point List',
    'Card Gallery',
    'TCG',
    'Konami',
    'YGOPRODeck',
  ],
  authors: [{ name: 'Genesys Point List Visualizer' }],
  openGraph: {
    title: 'GENESYS POINT LIST VISUALIZER',
    description: 'Explore the official Yu-Gi-Oh! Genesys point list visually.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07090e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.ygoprodeck.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-darkest)' }}>
          <Suspense fallback={<nav style={{ height: 60, margin: '12px 16px 0 16px' }} />}>
            <Navbar />
          </Suspense>
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
              {children}
            </Suspense>
          </main>
          {/* Footer with honest official attribution and structured directory */}
          <footer
            style={{
              marginTop: 'auto',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(7, 9, 14, 0.95)',
              padding: '32px 16px 28px 16px',
              fontSize: '0.775rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 24,
                  paddingBottom: 24,
                  marginBottom: 20,
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {/* Brand Column */}
                <div style={{ maxWidth: 360 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>GENESYS POINT LIST VISUALIZER</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(2, 132, 199, 0.25)', color: 'var(--color-cyan)', fontWeight: 700 }}>
                      COMMUNITY
                    </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                    The high-performance visual cardboard companion for the official Yu-Gi-Oh! Genesys format. Featuring 100-point budget meters, YCS Houston 2026 tournament decklists, and local BroccoliDB CAS vault caching.
                  </p>
                </div>

                {/* Quick Navigation Links */}
                <div>
                  <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Visualizer Directory
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.775rem' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>✨ Welcome &amp; Format Guide</Link>
                    <Link href="/cards" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>🃏 Point List &amp; Card Gallery</Link>
                    <Link href="/tournaments" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>🏛️ Tournaments Overview</Link>
                    <Link href="/decks" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>🏆 Top-Cut Decks Archive</Link>
                    <Link href="/bracket" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>⚔️ Playoff Bracket</Link>
                  </div>
                </div>

                {/* Official Sources */}
                <div>
                  <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Official Konami Sources
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.775rem' }}>
                    <a
                      href="https://www.yugioh-card.com/en/genesys/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-cyan)', textDecoration: 'none' }}
                    >
                      Official Genesys Format ↗
                    </a>
                    <a
                      href="https://yugiohblog.konami.com/2026/ycs/ycs-houston-genesys-main-event-top-32-deck-lists/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-cyan)', textDecoration: 'none' }}
                    >
                      Konami YCS Houston Top 32 ↗
                    </a>
                    <a
                      href="https://ygoprodeck.com/api-guide/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-cyan)', textDecoration: 'none' }}
                    >
                      YGOPRODeck Card API ↗
                    </a>
                  </div>
                </div>

                {/* Shortcuts & Storage Status */}
                <div>
                  <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Engine &amp; Shortcuts
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <div>Universal Search: <kbd>⌘K</kbd> or <kbd>/</kbd></div>
                    <div>Flip Decks: <kbd>[</kbd> and <kbd>]</kbd></div>
                    <div>Toggle View: <kbd>V</kbd></div>
                    <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                      <span>BroccoliDB CAS Vault Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Copyright Note */}
              <div style={{ textAlign: 'center', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                Official point values, card mechanics, and Yu-Gi-Oh! are © Konami Digital Entertainment. High-resolution imagery provided by YGOPRODeck.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
