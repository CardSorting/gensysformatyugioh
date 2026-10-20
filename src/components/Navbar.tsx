'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPalette } from './CommandPalette';
import { RulesModal } from './RulesModal';

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile drawer on route change (idiomatic React without cascading effects)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  const isHome = pathname === '/';
  const isCards = pathname?.startsWith('/cards');
  const isBracket = pathname?.includes('bracket');
  const isDecks = !isBracket && (pathname?.startsWith('/decks') || pathname?.includes('/decks/'));
  const isTournaments = !isBracket && !isDecks && pathname?.startsWith('/tournaments');

  // Global keyboard shortcut: Cmd+K or Ctrl+K or / opens quick command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className="no-print glass-panel"
        style={{
          margin: '12px 16px 0 16px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          position: 'sticky',
          top: 10,
          zIndex: 50,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Brand & Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0284c7, #00f0ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-cyan)',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                color: '#07090e',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              GP
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    color: '#fff',
                    textTransform: 'uppercase',
                  }}
                >
                  GENESYS
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-cyan)',
                    letterSpacing: '1px',
                  }}
                >
                  COMPANION
                </span>
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', lineHeight: 1.1 }}>
                Official Yu-Gi-Oh! Points &amp; Tournaments
              </div>
            </div>
          </Link>

          {/* Quick Rules Badge Pill */}
          <button
            onClick={() => setIsRulesOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: 'var(--color-gold-light)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.675rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to view official Genesys format rules & 100-point budget cap"
          >
            <span>⚡ 100-PT CAP</span>
          </button>
        </div>

        {/* Global Quick Search (⌘K) Trigger */}
        <div style={{ flex: '1 1 200px', maxWidth: 300, minWidth: 160 }}>
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'var(--text-dim)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-cyan)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-dim)';
            }}
            title="Press Cmd+K or click to search all cards, decks, and tournaments"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔍</span>
              <span>Search cards or decks...</span>
            </div>
            <kbd
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.675rem',
                padding: '2px 5px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Primary Desktop Navigation Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              background: isHome ? 'var(--bg-surface-raised)' : 'transparent',
              color: isHome ? 'var(--color-cyan)' : 'var(--text-muted)',
              border: `1px solid ${isHome ? 'var(--color-cyan)' : 'transparent'}`,
              boxShadow: isHome ? '0 0 12px rgba(0, 240, 255, 0.2)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>✨</span>
            <span>Welcome</span>
          </Link>

          <Link
            href="/cards"
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              background: isCards ? 'var(--bg-surface-raised)' : 'transparent',
              color: isCards ? 'var(--color-cyan)' : 'var(--text-muted)',
              border: `1px solid ${isCards ? 'var(--color-cyan)' : 'transparent'}`,
              boxShadow: isCards ? '0 0 12px rgba(0, 240, 255, 0.2)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>🃏</span>
            <span>Point List</span>
          </Link>

          <Link
            href="/tournaments"
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              background: isTournaments ? 'var(--bg-surface-raised)' : 'transparent',
              color: isTournaments ? 'var(--color-cyan)' : 'var(--text-muted)',
              border: `1px solid ${isTournaments ? 'var(--color-cyan)' : 'transparent'}`,
              boxShadow: isTournaments ? '0 0 12px rgba(0, 240, 255, 0.2)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>🏛️</span>
            <span>Tournaments</span>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: 10,
                background: 'rgba(2, 132, 199, 0.25)',
                color: 'var(--color-cyan)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              2
            </span>
          </Link>

          <Link
            href="/decks"
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              background: isDecks ? 'var(--bg-surface-raised)' : 'transparent',
              color: isDecks ? 'var(--color-gold-light)' : 'var(--text-muted)',
              border: `1px solid ${isDecks ? 'rgba(245, 158, 11, 0.7)' : 'transparent'}`,
              boxShadow: isDecks ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>🏆</span>
            <span>Decks Archive</span>
          </Link>

          <Link
            href="/bracket"
            style={{
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              background: isBracket ? 'var(--bg-surface-raised)' : 'transparent',
              color: isBracket ? 'var(--color-cyan)' : 'var(--text-muted)',
              border: `1px solid ${isBracket ? 'var(--color-cyan)' : 'transparent'}`,
              boxShadow: isBracket ? '0 0 12px rgba(0, 240, 255, 0.2)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>⚔️</span>
            <span>Playoff Bracket</span>
          </Link>

          {/* In-process BroccoliDB / Queue status dot */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
            title="BroccoliDB CAS Storage Vault & BroccoliQueue In-Process Engine: Operational"
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span>CAS Vault</span>
          </div>

          {/* External Links */}
          <a
            href="https://yugiohblog.konami.com/2026/ycs/ycs-houston-genesys-main-event-top-32-deck-lists/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-secondary"
            style={{
              textDecoration: 'none',
              fontSize: '0.725rem',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Official Konami Coverage of YCS Houston Genesys Main Event"
          >
            <span>Konami Coverage</span>
            <span style={{ fontSize: '0.675rem', color: 'var(--color-gold-light)' }}>↗</span>
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-nav-toggle btn btn-secondary btn-sm"
          aria-label="Toggle mobile menu"
          style={{ fontSize: '1rem', padding: '6px 12px' }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation Drawer"
          className="glass-panel"
          style={{
            margin: '8px 16px 0 16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 49,
            position: 'sticky',
            top: 70,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '10px 14px',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔍</span>
              <span>Search Cards &amp; Decks</span>
            </span>
            <kbd>⌘K</kbd>
          </button>

          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              background: isHome ? 'var(--bg-surface-raised)' : 'transparent',
              color: isHome ? 'var(--color-cyan)' : '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>✨</span>
            <span>Welcome &amp; Introduction</span>
          </Link>

          <Link
            href="/cards"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              background: isCards ? 'var(--bg-surface-raised)' : 'transparent',
              color: isCards ? 'var(--color-cyan)' : '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>🃏</span>
            <span>Point List Visualizer</span>
          </Link>

          <Link
            href="/tournaments"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              background: isTournaments ? 'var(--bg-surface-raised)' : 'transparent',
              color: isTournaments ? 'var(--color-cyan)' : '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>🏛️</span>
            <span>Tournaments Overview</span>
          </Link>

          <Link
            href="/decks"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              background: isDecks ? 'var(--bg-surface-raised)' : 'transparent',
              color: isDecks ? 'var(--color-gold-light)' : '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>🏆</span>
            <span>Tournament Decks Archive</span>
          </Link>

          <Link
            href="/bracket"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              background: isBracket ? 'var(--bg-surface-raised)' : 'transparent',
              color: isBracket ? 'var(--color-cyan)' : '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>⚔️</span>
            <span>Playoff Elimination Bracket</span>
          </Link>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsRulesOpen(true);
            }}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: 'var(--color-gold-light)',
              padding: '10px 14px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textAlign: 'left',
            }}
          >
            <span>⚡</span>
            <span>Official Rules &amp; 100-Point Budget Cap</span>
          </button>
        </nav>
      )}

      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Global Format Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </>
  );
}
