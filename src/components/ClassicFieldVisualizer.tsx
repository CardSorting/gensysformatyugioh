'use client';

import React, { useState } from 'react';

export function ClassicFieldVisualizer() {
  const [activeMode, setActiveMode] = useState<'genesys' | 'advanced'>('genesys');

  return (
    <div>
      {/* Header Mode Switcher Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Board Comparison:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Toggle formats to visualize field differences
          </span>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--bg-primary)',
            padding: 4,
            borderRadius: 10,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setActiveMode('genesys')}
            style={{
              padding: '6px 14px',
              borderRadius: 7,
              background: activeMode === 'genesys' ? 'var(--bg-surface-raised)' : 'transparent',
              color: activeMode === 'genesys' ? 'var(--color-cyan)' : 'var(--text-muted)',
              border: activeMode === 'genesys' ? '1px solid var(--color-cyan)' : '1px solid transparent',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ⚡ Genesys Classic (5×5)
          </button>
          <button
            onClick={() => setActiveMode('advanced')}
            style={{
              padding: '6px 14px',
              borderRadius: 7,
              background: activeMode === 'advanced' ? 'var(--bg-surface-raised)' : 'transparent',
              color: activeMode === 'advanced' ? 'var(--color-gold-light)' : 'var(--text-muted)',
              border: activeMode === 'advanced' ? '1px solid var(--color-gold-light)' : '1px solid transparent',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Advanced Format (EMZ + Scales)
          </button>
        </div>
      </div>

      {/* Field Diagram Container */}
      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-bright)',
          borderRadius: 12,
          padding: '20px 14px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        {/* Opponent Side Indicator */}
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
          ▲ Opponent Field Direction ▲
        </div>

        {/* Extra Monster Zones (Only in Advanced) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 50,
            marginBottom: 16,
            minHeight: 46,
            alignItems: 'center',
          }}
        >
          {activeMode === 'advanced' ? (
            <>
              <div
                style={{
                  width: 68,
                  height: 44,
                  borderRadius: 6,
                  border: '1.5px dashed #f59e0b',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold-light)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                <span>EMZ 1</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Link / Extra</span>
              </div>

              <div
                style={{
                  width: 68,
                  height: 44,
                  borderRadius: 6,
                  border: '1.5px dashed #f59e0b',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold-light)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                <span>EMZ 2</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Link / Extra</span>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                color: 'var(--color-cyan)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🚫 NO EXTRA MONSTER ZONES</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                (Summon all Extra Deck monsters directly to any Main Zone)
              </span>
            </div>
          )}
        </div>

        {/* Row 1: Field Spell + 5 Main Monster Zones + Graveyard */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            marginBottom: 10,
            maxWidth: 780,
            margin: '0 auto 10px auto',
          }}
        >
          {/* Field Spell Zone */}
          <div
            style={{
              aspectRatio: '3 / 4',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              fontSize: '0.65rem',
              fontWeight: 700,
              textAlign: 'center',
              padding: 4,
            }}
          >
            <span>FIELD</span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Spell</span>
          </div>

          {/* 5 Main Monster Zones */}
          {[1, 2, 3, 4, 5].map(slot => (
            <div
              key={`mmz-${slot}`}
              style={{
                aspectRatio: '3 / 4',
                borderRadius: 6,
                background: 'rgba(2, 132, 199, 0.15)',
                border: '1px solid rgba(2, 132, 199, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-cyan)',
                fontSize: '0.7rem',
                fontWeight: 800,
                textAlign: 'center',
                padding: 4,
              }}
            >
              <span>MMZ {slot}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Monster</span>
            </div>
          ))}

          {/* Graveyard (GY) */}
          <div
            style={{
              aspectRatio: '3 / 4',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              textAlign: 'center',
              padding: 4,
            }}
          >
            <span>GY</span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Graveyard</span>
          </div>
        </div>

        {/* Row 2: Extra Deck + 5 Spell/Trap Zones + Main Deck */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            maxWidth: 780,
            margin: '0 auto',
          }}
        >
          {/* Extra Deck Zone */}
          <div
            style={{
              aspectRatio: '3 / 4',
              borderRadius: 6,
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
              fontSize: '0.65rem',
              fontWeight: 700,
              textAlign: 'center',
              padding: 4,
            }}
          >
            <span>EXTRA</span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>0–15</span>
          </div>

          {/* 5 Spell / Trap Zones */}
          {[1, 2, 3, 4, 5].map(slot => {
            const isScaleSlot = activeMode === 'advanced' && (slot === 1 || slot === 5);
            return (
              <div
                key={`stz-${slot}`}
                style={{
                  aspectRatio: '3 / 4',
                  borderRadius: 6,
                  background: isScaleSlot
                    ? 'rgba(245, 158, 11, 0.18)'
                    : 'rgba(234, 179, 8, 0.08)',
                  border: isScaleSlot
                    ? '1.5px solid #f59e0b'
                    : '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isScaleSlot ? 'var(--color-gold-light)' : 'var(--text-gold)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  padding: 4,
                }}
              >
                <span>STZ {slot}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>
                  {isScaleSlot ? 'Scale / ST' : 'Spell / Trap'}
                </span>
              </div>
            );
          })}

          {/* Main Deck Zone */}
          <div
            style={{
              aspectRatio: '3 / 4',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              textAlign: 'center',
              padding: 4,
            }}
          >
            <span>DECK</span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>40–60</span>
          </div>
        </div>
      </div>

      {/* Field Takeaways Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cyan)', marginBottom: 2 }}>
            🛡️ Free Extra Deck Placement
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            In Genesys, your Fusion, Synchro, and Xyz summons are placed directly into any open Main Monster Zone (slots 1 through 5). No link arrows required.
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginBottom: 2 }}>
            📜 Clean Spell &amp; Trap Grid
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Columns 1 and 5 act solely as standard Spell &amp; Trap zones. Without Pendulum scales to occupy slots, backrow strategies and continuous spells breathe freely.
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold-light)', marginBottom: 2 }}>
            ⚡ Fast, Intuitive Board States
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            No link arrows, co-linking, or complex link-laddering chains. Monster positioning is clean, readable, and easy to parse at a glance.
          </div>
        </div>
      </div>
    </div>
  );
}
