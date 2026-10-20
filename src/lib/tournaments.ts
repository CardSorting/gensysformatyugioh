import ycsHoustonRaw from '@/data/tournaments/ycs-houston-2026.json';
import giantCardRaw from '@/data/tournaments/genesys-giant-card-houston-2026.json';
import { TournamentData, TournamentDeck, TournamentSummary } from '@/types/tournament';

const ycsHouston = ycsHoustonRaw as unknown as TournamentData;
const giantCard = giantCardRaw as unknown as TournamentData;

// Tournament Registry (Extensible for all future Genesys tournaments)
const tournamentsList: TournamentData[] = [
  {
    ...ycsHouston,
    shortTitle: 'YCS Houston 2026',
    year: 2026,
    city: 'Houston',
    country: 'United States',
    tier: 'YCS Premier Event',
    status: 'Completed',
  },
  {
    ...giantCard,
    shortTitle: 'Giant Card Houston 2026',
    year: 2026,
    city: 'Houston',
    country: 'United States',
    tier: 'Championship Playoff',
    status: 'Completed',
  },
];

const tournamentMap = new Map<string, TournamentData>(
  tournamentsList.map(t => [t.id, t])
);

// Default premier tournament
export const DEFAULT_TOURNAMENT_ID = 'ycs-houston-2026';

export function getAllTournaments(): TournamentSummary[] {
  return tournamentsList.map(t => ({
    id: t.id,
    title: t.title,
    shortTitle: t.shortTitle || t.title,
    date: t.date,
    year: t.year || 2026,
    location: t.location,
    city: t.city || 'Houston',
    country: t.country || 'United States',
    tier: t.tier || 'Premier Event',
    status: t.status || 'Completed',
    format: t.format,
    totalDecks: t.totalDecks || t.decks.length,
    sourceUrl: t.sourceUrl,
    champion: t.champion,
    topArchetypes: t.metagame ? t.metagame.slice(0, 3).map(m => ({ archetype: m.archetype, percentage: m.percentage })) : [],
  }));
}

export function getTournamentById(tournamentId: string): TournamentData | undefined {
  if (!tournamentId) return undefined;
  return tournamentMap.get(tournamentId) || tournamentsList.find(t => t.id.toLowerCase() === tournamentId.toLowerCase());
}

export function getDefaultTournament(): TournamentData {
  return tournamentMap.get(DEFAULT_TOURNAMENT_ID) || tournamentsList[0];
}

// Backwards-compatible accessor for default tournament
export function getTournamentData(): TournamentData {
  return getDefaultTournament();
}

export function getAllDecks(): TournamentDeck[] {
  return getDefaultTournament().decks;
}

export function getAllDecksAcrossAllTournaments(): Array<{ deck: TournamentDeck; tournament: TournamentData }> {
  const result: Array<{ deck: TournamentDeck; tournament: TournamentData }> = [];
  for (const t of tournamentsList) {
    for (const d of t.decks) {
      result.push({
        deck: {
          ...d,
          tournamentId: t.id,
          tournamentTitle: t.shortTitle || t.title,
        },
        tournament: t,
      });
    }
  }
  return result;
}

export function getDeckFromTournament(tournamentId: string, idOrRank: string): TournamentDeck | undefined {
  const tourney = getTournamentById(tournamentId);
  if (!tourney) return undefined;

  // Try exact ID match
  const byId = tourney.decks.find(d => d.id === idOrRank);
  if (byId) return { ...byId, tournamentId: tourney.id, tournamentTitle: tourney.shortTitle || tourney.title };

  // Try rank number match (e.g. "1", "2")
  const rankNum = parseInt(idOrRank, 10);
  if (!isNaN(rankNum)) {
    const byRank = tourney.decks.find(d => d.rank === rankNum);
    if (byRank) return { ...byRank, tournamentId: tourney.id, tournamentTitle: tourney.shortTitle || tourney.title };
  }

  // Try partial slug match
  const lower = idOrRank.toLowerCase();
  const bySlug = tourney.decks.find(d => d.id.toLowerCase().includes(lower) || d.name.toLowerCase().includes(lower));
  if (bySlug) return { ...bySlug, tournamentId: tourney.id, tournamentTitle: tourney.shortTitle || tourney.title };

  return undefined;
}

export function getDeckUniversal(idOrRank: string): { deck: TournamentDeck; tournament: TournamentData } | undefined {
  if (!idOrRank) return undefined;

  for (const t of tournamentsList) {
    const found = getDeckFromTournament(t.id, idOrRank);
    if (found) {
      return { deck: found, tournament: t };
    }
  }
  return undefined;
}

export function getDeckById(idOrRank: string): TournamentDeck | undefined {
  return getDeckUniversal(idOrRank)?.deck;
}

export function generateYdkContent(deck: TournamentDeck): string {
  let ydk = `#created by Genesys Visualizer\n#tournament: ${deck.tournamentTitle || 'Official Genesys'}\n#deck: ${deck.name} - ${deck.archetype}\n#points: ${deck.pointsSummary.total}/100 PTS\n#main\n`;
  for (const c of deck.mainDeck) {
    for (let i = 0; i < c.count; i++) {
      ydk += `${c.cardId}\n`;
    }
  }
  ydk += `#extra\n`;
  for (const c of deck.extraDeck) {
    for (let i = 0; i < c.count; i++) {
      ydk += `${c.cardId}\n`;
    }
  }
  ydk += `!side\n`;
  for (const c of deck.sideDeck) {
    for (let i = 0; i < c.count; i++) {
      ydk += `${c.cardId}\n`;
    }
  }
  return ydk;
}

export function generateTextDecklist(deck: TournamentDeck): string {
  let text = `# ${deck.name} - ${deck.archetype} (${deck.placement})\n`;
  text += `# Tournament: ${deck.tournamentTitle || 'Official Genesys Tournament'}\n`;
  text += `# Total Points: ${deck.pointsSummary.total} / 100 PTS (Budget Compliant)\n\n`;

  text += `# Main Deck (${deck.counts.main} cards - ${deck.pointsSummary.main} pts):\n`;
  for (const c of deck.mainDeck) {
    text += `${c.count}x ${c.name}${c.points > 0 ? ` (${c.points}p ea / ${c.totalPoints}p)` : ''}\n`;
  }

  text += `\n# Extra Deck (${deck.counts.extra} cards - ${deck.pointsSummary.extra} pts):\n`;
  for (const c of deck.extraDeck) {
    text += `${c.count}x ${c.name}${c.points > 0 ? ` (${c.points}p ea / ${c.totalPoints}p)` : ''}\n`;
  }

  text += `\n# Side Deck (${deck.counts.side} cards - ${deck.pointsSummary.side} pts):\n`;
  for (const c of deck.sideDeck) {
    text += `${c.count}x ${c.name}${c.points > 0 ? ` (${c.points}p ea / ${c.totalPoints}p)` : ''}\n`;
  }
  return text;
}

export function getAdjacentDecks(tournamentId: string, deckId: string): { prevDeck: TournamentDeck | null; nextDeck: TournamentDeck | null } {
  const tourney = getTournamentById(tournamentId);
  if (!tourney) return { prevDeck: null, nextDeck: null };
  const idx = tourney.decks.findIndex(d => d.id === deckId || String(d.rank) === deckId);
  if (idx === -1) return { prevDeck: null, nextDeck: null };
  return {
    prevDeck: idx > 0 ? tourney.decks[idx - 1] : null,
    nextDeck: idx < tourney.decks.length - 1 ? tourney.decks[idx + 1] : null,
  };
}

export function getDecksFeaturingCard(cardId: number, cardName?: string): Array<{
  deck: TournamentDeck;
  tournament: TournamentData;
  count: number;
  section: string;
}> {
  const results: Array<{
    deck: TournamentDeck;
    tournament: TournamentData;
    count: number;
    section: string;
  }> = [];

  const lowerName = cardName?.toLowerCase();

  for (const tourney of tournamentsList) {
    for (const deck of tourney.decks) {
      let count = 0;
      let section = 'Main';
      for (const c of deck.mainDeck) {
        if (c.cardId === cardId || (lowerName && c.name.toLowerCase() === lowerName)) {
          count += c.count;
          section = 'Main';
        }
      }
      for (const c of deck.extraDeck) {
        if (c.cardId === cardId || (lowerName && c.name.toLowerCase() === lowerName)) {
          count += c.count;
          section = 'Extra';
        }
      }
      for (const c of deck.sideDeck) {
        if (c.cardId === cardId || (lowerName && c.name.toLowerCase() === lowerName)) {
          count += c.count;
          section = count > c.count ? 'Main + Side' : 'Side';
        }
      }
      if (count > 0) {
        results.push({ deck, tournament: tourney, count, section });
      }
    }
  }

  // Sort by deck rank (Champions & highest seeds first)
  results.sort((a, b) => a.deck.rank - b.deck.rank);
  return results;
}
