import React from 'react';
import Link from 'next/link';
import { getTournamentById, getDefaultTournament, getAllTournaments } from '@/lib/tournaments';
import { TournamentBracketView } from '@/components/TournamentBracketView';

export function generateStaticParams() {
  return getAllTournaments().map((t) => ({
    tournamentId: t.id,
  }));
}

export default async function DynamicTournamentBracketPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const tournament = getTournamentById(tournamentId) || getDefaultTournament();

  if (!tournament) {
    return (
      <div style={{ maxWidth: 860, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: 48, borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 10px 0' }}>Tournament Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 24px auto' }}>
            Could not find tournament &ldquo;{tournamentId}&rdquo;.
          </p>
          <Link href="/tournaments" className="btn btn-primary">
            Browse All Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return <TournamentBracketView tournament={tournament} />;
}
