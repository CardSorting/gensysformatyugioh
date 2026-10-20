'use client';

import React, { useEffect } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="modal-content glass-panel-raised"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 580,
          width: '100%',
          padding: 24,
          border: '1px solid var(--border-medium)',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>📜</span>
            <h3 id="rules-modal-title" style={{ fontFamily: 'var(--font-display)', color: '#fff', margin: 0, fontSize: '1.25rem' }}>
              Yu-Gi-Oh! Genesys Official Format Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
            title="Close rules modal (Esc)"
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--color-gold-light)' }}>1. 100-Point Budget Cap:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
              A deck (combined Main Deck, Extra Deck, and Side Deck) cannot exceed <strong>100 total Genesys points</strong>. Every card with an assigned point value contributes directly to this format budget.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--color-cyan)' }}>2. Point Multipliers for Multiple Copies:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
              Each copy of a card consumes its full point cost (e.g., 1 copy of Ash Blossom &amp; Joyous Spring = 18 pts; 3 copies = 54 pts).
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: '#34d399' }}>3. Unlisted Cards Cost 0 Points:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
              Any card not published on the official Genesys point list has an official cost of <strong>0 points</strong> and can be run up to 3 copies for free without reducing the 100-point budget.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface-raised)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: '#f87171' }}>4. Banned Summoning Mechanics:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
              <strong>Link Monsters</strong> and <strong>Pendulum Monsters</strong> are 100% forbidden in the Genesys format. All Link and Pendulum zones and mechanics are disallowed.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href="https://www.yugioh-card.com/en/genesys/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            🔗 Konami Official Site ↗
          </a>
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
