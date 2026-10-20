'use client';

import React, { useState } from 'react';
import { VisualParadigmShift } from '@/components/VisualParadigmShift';
import { VisualOntologyDiagram } from '@/components/VisualOntologyDiagram';
import { ClassicFieldVisualizer } from '@/components/ClassicFieldVisualizer';
import { VisualComparisonCards } from '@/components/VisualComparisonCards';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  badge: string;
  badgeColor: string;
}

const TABS: TabItem[] = [
  { id: 'paradigm', label: 'Legality Shift', icon: '⚡', badge: 'Pot of Greed Test', badgeColor: 'var(--color-cyan)' },
  { id: 'ontology', label: '4 Format Principles', icon: '🧭', badge: 'System Architecture', badgeColor: '#c084fc' },
  { id: 'battlefield', label: 'Classic 5×5 Board', icon: '🏟️', badge: 'No Extra Monster Zones', badgeColor: '#10b981' },
  { id: 'comparison', label: 'Genesys vs Advanced', icon: '⚖️', badge: 'Side-by-Side Reality', badgeColor: 'var(--color-gold-light)' },
];

export function FormatRulesConsole() {
  const [activeTab, setActiveTab] = useState<string>('paradigm');

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 16,
        padding: '24px 20px',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Console Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
          <span>🧭</span>
          <span>Unified Format Console &bull; Rules, Ontology &amp; Battlefield</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', margin: '0 0 6px 0', fontWeight: 800 }}>
          Master the Genesys Format in 4 Visual Lenses
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: 780 }}>
          Switch between the interactive visual tools below to inspect card legalities, system architecture, board anatomy, and side-by-side rules.
        </p>
      </div>

      {/* 4 Interactive Lens Selector Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
          marginBottom: 20,
          background: 'rgba(0,0,0,0.35)',
          padding: 8,
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
        }}
      >
        {TABS.map(tab => {
          const isSelected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: isSelected ? 'var(--bg-surface-raised)' : 'transparent',
                border: isSelected ? `1.5px solid ${tab.badgeColor}` : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 0 16px ${tab.badgeColor}22` : 'none',
              }}
            >
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{tab.icon}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text-muted)', lineHeight: 1.25 }}>
                  {tab.label}
                </div>
                <div style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: isSelected ? tab.badgeColor : 'var(--text-dim)', marginTop: 2 }}>
                  {tab.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Visual Lens Container */}
      <div>
        {activeTab === 'paradigm' && <VisualParadigmShift />}
        {activeTab === 'ontology' && <VisualOntologyDiagram />}
        {activeTab === 'battlefield' && <ClassicFieldVisualizer />}
        {activeTab === 'comparison' && <VisualComparisonCards />}
      </div>
    </div>
  );
}
