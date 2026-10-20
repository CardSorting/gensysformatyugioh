import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StickySubNav } from '@/components/StickySubNav';
import { HeroVisualFormula } from '@/components/HeroVisualFormula';
import { FormatRulesConsole } from '@/components/FormatRulesConsole';
import { BudgetSandbox } from '@/components/BudgetSandbox';
import { VisualPointShelves } from '@/components/VisualPointShelves';
import { VisualLearningRoadmap } from '@/components/VisualLearningRoadmap';
import { StrategySpotlight } from '@/components/StrategySpotlight';
import { FaqAccordion } from '@/components/FaqAccordion';
import cardsRaw from '@/data/cards.json';
import { Card } from '@/types/card';

export const metadata: Metadata = {
  title: 'Yu-Gi-Oh! Genesys — Official Format Welcome & Introduction Guide',
  description:
    'A world-class visual welcome guide to the official Yu-Gi-Oh! Genesys format. Learn the 100-point deckbuilding budget, classic 5x5 board, tournament results, and explore the point list.',
  keywords: [
    'Yu-Gi-Oh Genesys',
    'Genesys Format',
    '100 Point Budget',
    'Yu-Gi-Oh Alternative Format',
    'YCS Houston Genesys',
    'Genesys Point List',
    'How to play Genesys',
    'Genesys Rules',
  ],
};

const localCards: Card[] = cardsRaw as Card[];

export default function WelcomeHomePage() {
  const totalPointBearing = localCards.filter(c => (c.points || 0) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 60 }}>
      {/* 1. FULL-WIDTH CINEMATIC HEADER BANNER (TEXT-FREE ART + BROADCAST HUD) */}
      <div
        style={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: '#04060a',
          borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(300px, 36vw, 480px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src="/images/genesys_header_banner.jpg"
            alt="Yu-Gi-Oh! Genesys Championship Arena"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
            }}
            loading="eager"
          />
          {/* Cinematic Vignette & Bottom Blends */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at center, rgba(7, 9, 14, 0.1) 0%, rgba(7, 9, 14, 0.4) 65%, rgba(7, 9, 14, 0.95) 100%), linear-gradient(180deg, rgba(7, 9, 14, 0.2) 0%, rgba(7, 9, 14, 0.05) 40%, rgba(7, 9, 14, 0.85) 85%, var(--bg-primary) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Centered Holographic Broadcast HUD Showcase */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 16px',
              zIndex: 2,
            }}
          >
            {/* Top Badge Ticker */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'rgba(2, 132, 199, 0.95)',
                  color: '#fff',
                  letterSpacing: '0.5px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 0 16px rgba(0, 240, 255, 0.5)',
                }}
              >
                GENESYS CHAMPIONSHIP ARENA
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--color-gold-light)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  backdropFilter: 'blur(8px)',
                  fontWeight: 800,
                }}
              >
                ⚡ OFFICIAL KONAMI FORMAT
              </span>
            </div>

            {/* Arena Title */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
                color: '#fff',
                fontWeight: 900,
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 240, 255, 0.4)',
                letterSpacing: '-0.3px',
                marginBottom: 12,
              }}
            >
              Restored 5×5 Dueling • 100-Point Budget
            </div>

            {/* 4 Format Pillar Ticker Chips */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                justifyContent: 'center',
                background: 'rgba(7, 9, 14, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '6px 14px',
                borderRadius: 24,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', fontWeight: 800 }}>
                <span>⚡</span>
                <span>100 PTS WALLET</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)', fontWeight: 800 }}>
                <span>🃏</span>
                <span>{totalPointBearing} POINTED CARDS</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 800 }}>
                <span>🔓</span>
                <span>10,000+ FREE CARDS</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: '#fca5a5', fontWeight: 800 }}>
                <span>🚫</span>
                <span>0 LINKS / 0 PENDULUMS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. IN-PAGE STICKY SUB-NAV */}
      <StickySubNav />

      {/* 3. HERO OVERVIEW & INTERACTIVE DECK RIG */}
      <section
        id="hero"
        style={{
          background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(7, 9, 14, 0) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '24px 16px 28px 16px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* Main Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              color: '#fff',
              margin: '0 0 10px 0',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }}
          >
            Build with Points. Duel without Limits.
          </h1>

          {/* Concise Lead-In */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              color: 'var(--text-primary)',
              maxWidth: 780,
              lineHeight: 1.5,
              margin: '0 0 18px 0',
            }}
          >
            Konami&apos;s official point-budget format. Build a 70–85 card deck within a <strong>100-point budget</strong>.
            Link and Pendulum monsters are banned, restoring classic 5×5 field combat.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <a
              href="#sandbox"
              className="btn btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              <span>Try 100-Pt Sandbox</span>
              <span>🎛️</span>
            </a>

            <Link
              href="/cards"
              className="btn btn-secondary"
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              <span>Explore Point List ({totalPointBearing} Cards)</span>
              <span>→</span>
            </Link>

            <Link
              href="/tournaments/ycs-houston-2026"
              style={{
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-cyan)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>YCS Houston 2026 Decks</span>
              <span>↗</span>
            </Link>
          </div>

          {/* Hero Visual Formula (Interactive Format Deck Rig) */}
          <HeroVisualFormula />
        </div>
      </section>

      {/* 4. UNIFIED RULES, ONTOLOGY & BATTLEFIELD CONSOLE */}
      <section id="rules" style={{ padding: '28px 16px 20px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <FormatRulesConsole />
      </section>

      {/* 5. INTERACTIVE 100-POINT BUDGET SANDBOX (PLAYGROUND) */}
      <section id="sandbox" style={{ padding: '24px 16px 24px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <BudgetSandbox />
      </section>

      {/* 6. VISUAL CARD SHELVES (PRICE TAGS IN ACTION) */}
      <section id="shelves" style={{ padding: '16px 16px 24px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <VisualPointShelves />
      </section>

      {/* 7. VISUAL 4-STEP LEARNING ROADMAP */}
      <section id="how-to-build" style={{ padding: '16px 16px 28px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
            <span>🎓</span>
            <span>The 4-Step Journey</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 800 }}>
            How to Build Your First Genesys Deck
          </h3>
        </div>

        <VisualLearningRoadmap />
      </section>

      {/* 8. YCS HOUSTON 2026 STRATEGY SPOTLIGHT & METAGAME HUB */}
      <section id="metagame" style={{ padding: '16px 16px 28px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <StrategySpotlight />

        {/* COMPANION PLATFORM GATEWAYS */}
        <div style={{ marginTop: 32, marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
            <span>🛠️</span>
            <span>Explore the Platform</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 800 }}>
            Genesys Companion Suite
          </h3>
        </div>

        {/* 4 Gateway Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
            marginBottom: 32,
          }}
        >
          <Link
            href="/cards"
            style={{
              textDecoration: 'none',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
            className="hover-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>🃏</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: 'var(--color-cyan)', background: 'rgba(0, 240, 255, 0.15)', padding: '2px 7px', borderRadius: 4 }}>
                {totalPointBearing} CARDS
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              Point List Visualizer
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.35, flex: 1 }}>
              Browse official point costs with live search, tier filters, table/grid views, and high-res art.
            </div>
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: 700 }}>
              Open Gallery →
            </div>
          </Link>

          <Link
            href="/tournaments/ycs-houston-2026"
            style={{
              textDecoration: 'none',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
            className="hover-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>🏛️</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: 'var(--color-gold-light)', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 7px', borderRadius: 4 }}>
                YCS HOUSTON
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              Metagame Hub
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.35, flex: 1 }}>
              Metagame share distribution charts, archetype conversion tiers, and player statistics.
            </div>
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: 700 }}>
              View Metagame Stats →
            </div>
          </Link>

          <Link
            href="/decks"
            style={{
              textDecoration: 'none',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
            className="hover-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>🏆</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 4 }}>
                32 DECKLISTS
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              Top 32 Decks Archive
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.35, flex: 1 }}>
              Complete card spreads for all qualified tournament lists with Main, Extra, Side, and point tallies.
            </div>
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--color-gold-light)', fontWeight: 700 }}>
              Browse Decklists →
            </div>
          </Link>

          <Link
            href="/bracket"
            style={{
              textDecoration: 'none',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
            className="hover-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>⚔️</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: '#c084fc', background: 'rgba(192, 132, 252, 0.15)', padding: '2px 7px', borderRadius: 4 }}>
                5 ROUNDS
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              Playoff Elimination Tree
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.35, flex: 1 }}>
              Interactive playoff elimination bracket tracking every match from Round of 32 to the Grand Finals.
            </div>
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: 700 }}>
              View Bracket →
            </div>
          </Link>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
            <span>❓</span>
            <span>Quick Answers</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 800 }}>
            Frequently Asked Questions
          </h3>
        </div>
        <FaqAccordion />

        {/* AUTHORITATIVE KONAMI SOURCES DOCK */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-medium)' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-gold-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
              <span>📚</span>
              <span>Official Konami Documentation</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
              Official Konami Portals &amp; Guides
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 12,
            }}
          >
            <a
              href="https://www.yugioh-card.com/en/genesys/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="hover-card"
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Official Genesys Hub</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>yugioh-card.com/en/genesys</div>
              </div>
              <span style={{ color: 'var(--color-cyan)', fontSize: '0.85rem' }}>↗</span>
            </a>

            <a
              href="https://www.yugioh-card.com/en/downloads/neuron/NEURON-Building_a_Genesys_Deck.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="hover-card"
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>NEURON Guide PDF</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>Official Konami PDF</div>
              </div>
              <span style={{ color: 'var(--color-cyan)', fontSize: '0.85rem' }}>↗</span>
            </a>

            <a
              href="https://yugiohblog.konami.com/category/genesys/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="hover-card"
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Konami Strategy Blog</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>yugiohblog.konami.com</div>
              </div>
              <span style={{ color: 'var(--color-cyan)', fontSize: '0.85rem' }}>↗</span>
            </a>

            <a
              href="https://www.yugioh-card.com/en/genesys/genesys-tournament-locations/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="hover-card"
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>OTS Store Locator</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>Find Local Tournaments</div>
              </div>
              <span style={{ color: 'var(--color-cyan)', fontSize: '0.85rem' }}>↗</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
