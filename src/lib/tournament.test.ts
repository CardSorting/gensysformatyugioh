import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getTournamentData,
  getAllDecks,
  getDeckById,
  getAllTournaments,
  getTournamentById,
  getDeckFromTournament,
  getDeckUniversal,
  generateYdkContent,
  generateTextDecklist,
  getAdjacentDecks,
} from './tournaments';

describe('YCS Houston 2026 - Top 32 Decklists Data Integrity', () => {
  const tournament = getTournamentData();
  const decks = getAllDecks();

  it('indexes all 32 qualified decklists from YCS Houston Genesys Main Event', () => {
    assert.strictEqual(decks.length, 32, 'Must contain exactly 32 decks');
    assert.strictEqual(tournament.totalDecks, 32, 'Tournament totalDecks must be 32');
  });

  it('verifies champion Enzo Fiallos (Rank 1, Blitzclique)', () => {
    const champion = decks[0];
    assert.strictEqual(champion.rank, 1);
    assert.strictEqual(champion.name, 'Enzo Maximiliano Fiallos Velasco');
    assert.strictEqual(champion.archetype, 'Blitzclique');
    assert.strictEqual(champion.placement, '1st Place Champion');
    assert.ok(champion.thumbnailUrl.includes('ygoprodeck.com'), 'Champion must have valid YGOPRODeck thumbnail');
  });

  it('verifies finalist Juan Andrade (Rank 2, Angelechy)', () => {
    const finalist = decks[1];
    assert.strictEqual(finalist.rank, 2);
    assert.strictEqual(finalist.name, 'Juan Sebastian Andrade Castro');
    assert.strictEqual(finalist.archetype, 'Angelechy');
    assert.strictEqual(finalist.placement, '2nd Place Finalist');
  });

  it('verifies every single deck complies with the 100-point Genesys budget cap', () => {
    for (const deck of decks) {
      assert.ok(
        deck.pointsSummary.total <= 100,
        `Deck ${deck.name} (#${deck.rank}) points (${deck.pointsSummary.total}) must not exceed 100 pts`
      );
      assert.ok(
        deck.pointsSummary.total >= 95,
        `Competitive deck ${deck.name} (#${deck.rank}) should maximize budget (got ${deck.pointsSummary.total} pts)`
      );
    }
  });

  it('verifies valid card counts across Main, Extra, and Side Decks for all players', () => {
    for (const deck of decks) {
      assert.ok(deck.counts.main >= 40 && deck.counts.main <= 60, `Main deck count (${deck.counts.main}) must be between 40 and 60`);
      assert.ok(deck.counts.extra <= 15, `Extra deck count (${deck.counts.extra}) must be <= 15`);
      assert.ok(deck.counts.side <= 15, `Side deck count (${deck.counts.side}) must be <= 15`);
    }
  });

  it('looks up decks correctly by exact ID and by rank number', () => {
    const byId = getDeckById('ycs-houston-2026-rank-1');
    assert.ok(byId, 'Must resolve deck by ID');
    assert.strictEqual(byId?.name, 'Enzo Maximiliano Fiallos Velasco');

    const byRank = getDeckById('6');
    assert.ok(byRank, 'Must resolve deck by rank number "6"');
    assert.strictEqual(byRank?.name, 'Jesse Dean Kotton');
    assert.strictEqual(byRank?.archetype, 'Magistus Fairy Tail');
  });

  it('validates tournament elimination bracket structure and thumbnail linkages', () => {
    const { finals, semifinals, quarterfinals } = tournament.bracket;

    assert.ok(finals.player1 && finals.player2, 'Finals must have 2 players');
    assert.strictEqual(finals.player1.name, 'Enzo Maximiliano Fiallos Velasco');
    assert.strictEqual(finals.player1.winner, true);
    assert.ok(finals.player1.thumbnailUrl.length > 0, 'Must have thumbnail');

    assert.strictEqual(semifinals.length, 2, 'Semifinals must have 2 matches');
    assert.strictEqual(quarterfinals.length, 4, 'Quarterfinals must have 4 matches');
  });
});

describe('Multi-Tournament Architecture & Universal Deck Routing', () => {
  it('registers multiple official Genesys tournaments throughout time', () => {
    const tourneys = getAllTournaments();
    assert.ok(tourneys.length >= 2, 'Must register at least 2 official tournaments');

    const ids = tourneys.map(t => t.id);
    assert.ok(ids.includes('ycs-houston-2026'));
    assert.ok(ids.includes('genesys-giant-card-houston-2026'));
  });

  it('resolves Giant Card Houston 2026 tournament and champion Jasper Martin', () => {
    const giantCard = getTournamentById('genesys-giant-card-houston-2026');
    assert.ok(giantCard, 'Must find Giant Card tournament by ID');
    assert.strictEqual(giantCard?.champion.name, 'Jasper Martin');
    assert.strictEqual(giantCard?.champion.archetype, 'Predaplant True Draco');
    assert.strictEqual(giantCard?.decks.length, 4, 'Must have Top 4 decks');
  });

  it('retrieves decks scoped to a specific tournament', () => {
    const deck = getDeckFromTournament('genesys-giant-card-houston-2026', 'giant-card-houston-2026-rank-1');
    assert.ok(deck, 'Must resolve deck from Giant Card tournament');
    assert.strictEqual(deck?.name, 'Jasper Martin');
    assert.strictEqual(deck?.tournamentId, 'genesys-giant-card-houston-2026');

    // Rank number lookup inside tournament
    const deckByRank = getDeckFromTournament('genesys-giant-card-houston-2026', '2');
    assert.ok(deckByRank, 'Must resolve rank 2 deck in Giant Card tournament');
    assert.strictEqual(deckByRank?.name, 'Dwayne Howell');
  });

  it('universally resolves any deck across all tournaments', () => {
    const ycsDeck = getDeckUniversal('ycs-houston-2026-rank-1');
    assert.ok(ycsDeck);
    assert.strictEqual(ycsDeck?.tournament.id, 'ycs-houston-2026');
    assert.strictEqual(ycsDeck?.deck.rank, 1);

    const giantDeck = getDeckUniversal('giant-card-houston-2026-rank-1');
    assert.ok(giantDeck);
    assert.strictEqual(giantDeck?.tournament.id, 'genesys-giant-card-houston-2026');
    assert.strictEqual(giantDeck?.deck.name, 'Jasper Martin');
  });

  it('generates standard simulator .ydk format for export', () => {
    const deck = getAllDecks()[0]; // Enzo Fiallos
    const ydk = generateYdkContent(deck);

    assert.ok(ydk.includes('#created by Genesys Visualizer'));
    assert.ok(ydk.includes('#main'));
    assert.ok(ydk.includes('#extra'));
    assert.ok(ydk.includes('!side'));

    // Check passcodes exist
    const lines = ydk.split('\n');
    const numericPasscodes = lines.filter(l => /^\d+$/.test(l.trim()));
    assert.strictEqual(
      numericPasscodes.length,
      deck.counts.main + deck.counts.extra + deck.counts.side,
      'YDK must have exactly the same number of passcodes as total deck cards'
    );
  });

  it('generates formatted text decklist with counts and point costs', () => {
    const deck = getAllDecks()[0];
    const text = generateTextDecklist(deck);

    assert.ok(text.includes('Enzo Maximiliano Fiallos Velasco'));
    assert.ok(text.includes('Total Points: 100 / 100 PTS'));
    assert.ok(text.includes('# Main Deck'));
    assert.ok(text.includes('# Extra Deck'));
    assert.ok(text.includes('# Side Deck'));
  });

  it('cycles adjacent decks correctly within tournament', () => {
    const { prevDeck: firstPrev, nextDeck: firstNext } = getAdjacentDecks('ycs-houston-2026', 'ycs-houston-2026-rank-1');
    assert.strictEqual(firstPrev, null, 'Rank 1 must have no previous deck');
    assert.strictEqual(firstNext?.rank, 2, 'Rank 1 next deck must be rank 2');

    const { prevDeck: midPrev, nextDeck: midNext } = getAdjacentDecks('ycs-houston-2026', 'ycs-houston-2026-rank-2');
    assert.strictEqual(midPrev?.rank, 1);
    assert.strictEqual(midNext?.rank, 3);
  });
});
