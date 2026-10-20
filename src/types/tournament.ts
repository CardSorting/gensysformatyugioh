export interface DeckCardItem {
  count: number;
  name: string;
  cardId: number;
  points: number;
  totalPoints: number;
  type: string;
  section: 'main' | 'extra' | 'side';
  category: string;
  imageUrl: string;
  imageCropped: string;
}

export interface DeckPointsSummary {
  total: number;
  main: number;
  extra: number;
  side: number;
  budget: number;
  remaining: number;
}

export interface TournamentDeck {
  id: string;
  rank: number;
  name: string;
  archetype: string;
  signatureCard: string;
  placement: string;
  thumbnailUrl: string;
  signatureCardId?: number;
  tournamentId?: string;
  tournamentTitle?: string;
  pointsSummary: DeckPointsSummary;
  counts: {
    main: number;
    extra: number;
    side: number;
  };
  mainDeck: DeckCardItem[];
  extraDeck: DeckCardItem[];
  sideDeck: DeckCardItem[];
}

export interface BracketPlayer {
  id: string;
  name: string;
  archetype: string;
  rank: number;
  thumbnailUrl: string;
  signatureCardId?: number;
  winner: boolean;
  score?: number;
}

export interface BracketMatch {
  matchId: string;
  round: string;
  table?: number;
  player1: BracketPlayer;
  player2: BracketPlayer;
}

export interface TournamentMetagameEntry {
  archetype: string;
  count: number;
  percentage: number;
}

export interface TournamentSummary {
  id: string;
  title: string;
  shortTitle: string;
  date: string;
  year: number;
  location: string;
  city: string;
  country: string;
  tier: string;
  status: string;
  format: string;
  totalDecks: number;
  sourceUrl: string;
  champion: {
    name: string;
    archetype: string;
    deckId: string;
    thumbnailUrl: string;
    signatureCardId?: number;
  };
  topArchetypes: Array<{ archetype: string; percentage: number }>;
}

export interface TournamentData {
  id: string;
  title: string;
  shortTitle?: string;
  date: string;
  year?: number;
  location: string;
  city?: string;
  country?: string;
  tier?: string;
  status?: string;
  sourceUrl: string;
  format: string;
  totalDecks: number;
  champion: {
    name: string;
    archetype: string;
    deckId: string;
    thumbnailUrl: string;
    signatureCardId?: number;
  };
  metagame: TournamentMetagameEntry[];
  bracket: {
    finals: BracketMatch;
    semifinals: BracketMatch[];
    quarterfinals: BracketMatch[];
  };
  decks: TournamentDeck[];
}
