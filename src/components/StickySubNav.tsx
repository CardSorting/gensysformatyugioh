'use client';

import React, { useState, useEffect } from 'react';

interface SubNavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: SubNavItem[] = [
  { id: 'hero', label: 'Overview', icon: '⚡' },
  { id: 'rules', label: 'Rules & Battlefield', icon: '🧭' },
  { id: 'sandbox', label: '100-Pt Sandbox', icon: '🎛️' },
  { id: 'shelves', label: 'Point Shelves', icon: '🏷️' },
  { id: 'how-to-build', label: 'How to Build', icon: '🎓' },
  { id: 'metagame', label: 'YCS Meta & FAQ', icon: '🏆' },
];

export function StickySubNav() {
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offsets = NAV_ITEMS.map(item => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: 0 };
        return { id: item.id, top: el.offsetTop - 140 };
      });

      for (let i = offsets.length - 1; i >= 0; i--) {
        if (scrollY >= offsets[i].top) {
          setActiveSection(offsets[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Page navigation"
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 72,
        zIndex: 40,
        margin: '0 16px 20px 16px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        boxShadow: 'var(--shadow-sm)',
        scrollbarWidth: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', paddingRight: 4, flexShrink: 0 }}>
          JUMP TO:
        </span>
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 20,
                background: isActive ? 'var(--bg-surface-raised)' : 'transparent',
                border: isActive ? '1px solid var(--color-cyan)' : '1px solid transparent',
                color: isActive ? 'var(--color-cyan)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'var(--bg-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '0.8rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
