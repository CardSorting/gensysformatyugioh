import React from 'react';
import { getAllTournaments } from '@/lib/tournaments';
import TournamentShowcaseClient from '@/components/TournamentShowcaseClient';

export function generateStaticParams() {
  return getAllTournaments().map((t) => ({
    tournamentId: t.id,
  }));
}

export default async function TournamentShowcasePage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  return <TournamentShowcaseClient tournamentId={tournamentId} />;
}
