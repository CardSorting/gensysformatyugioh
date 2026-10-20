import React from 'react';
import Link from 'next/link';
import {
  getDeckFromTournament,
  getTournamentById,
  DEFAULT_TOURNAMENT_ID,
  getAllDecksAcrossAllTournaments,
} from '@/lib/tournaments';
import { TournamentDeckView } from '@/components/TournamentDeckView';

export function generateStaticParams() {
  const all = getAllDecksAcrossAllTournaments();
  return all.map(({ tournament, deck }) => ({
    tournamentId: tournament.id,
    deckId: deck.id,
  }));
}

export default async function TournamentDecklistPage({
  params,
}: {
  params: Promise<{ tournamentId: string; deckId: string }>;
}) {
  const { tournamentId, deckId } = await params;
  const tournament = getTournamentById(tournamentId) || getTournamentById(DEFAULT_TOURNAMENT_ID);
  const deck = tournament ? getDeckFromTournament(tournament.id, deckId) : undefined;

  if (!tournament || !deck) {
    return (
      <div style={{ maxWidth: 860, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: 48, borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 10px 0' }}>Tournament Deck Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 24px auto' }}>
            Could not find deck matching ID &ldquo;{deckId}&rdquo; in tournament &ldquo;{tournamentId}&rdquo;.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/tournaments/${tournamentId}`} className="btn btn-primary">
              ← Return to {tournament?.shortTitle || 'Tournament'} Decks
            </Link>
            <Link href="/tournaments" className="btn btn-secondary">
              Browse All Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <TournamentDeckView tournament={tournament} deck={deck} />;
}
