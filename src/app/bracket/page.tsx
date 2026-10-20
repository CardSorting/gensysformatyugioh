'use client';

import React from 'react';
import { getDefaultTournament } from '@/lib/tournaments';
import { TournamentBracketView } from '@/components/TournamentBracketView';

export default function GlobalBracketShortcutPage() {
  const tournament = getDefaultTournament();
  return <TournamentBracketView tournament={tournament} />;
}
