'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { getDeckUniversal } from '@/lib/tournaments';
import { TournamentDeckView } from '@/components/TournamentDeckView';

export default function UniversalDeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const result = getDeckUniversal(id);

  if (!result) {
    return (
      <div style={{ maxWidth: 860, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: 48, borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 10px 0' }}>Deck Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 24px auto' }}>
            Could not find tournament deck matching identifier &ldquo;{id}&rdquo; across any registered tournaments.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/decks" className="btn btn-primary">
              ← Return to All Decks Showcase
            </Link>
            <Link href="/tournaments" className="btn btn-secondary">
              Browse Tournaments Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <TournamentDeckView tournament={result.tournament} deck={result.deck} />;
}
