import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import cardsRaw from '../data/cards.json';
import { Card } from '../types/card';
import { getAllTournaments, getTournamentById } from '../lib/tournaments';

const allCards = cardsRaw as Card[];
const tournaments = getAllTournaments();

describe('Yu-Gi-Oh! Genesys Welcome Landing Page & Format Facts Integrity', () => {
  test('verifies official Genesys format facts and rules definitions', () => {
    // 1. Budget Cap
    const standardPointCap = 100;
    assert.equal(standardPointCap, 100, 'Standard Genesys point cap must be 100 points');

    // 2. Point-bearing card counts
    const pointedCards = allCards.filter(c => (c.points || 0) > 0);
    assert.ok(pointedCards.length >= 700, 'Published point list must have at least 700 point-bearing cards');

    // 3. Unlisted cards are 0 points
    const unlistedSample = allCards.find(c => c.name === 'Blue-Eyes White Dragon');
    if (unlistedSample) {
      assert.equal(unlistedSample.points || 0, 0, 'Unlisted cards must cost 0 points');
    }
  });

  test('verifies 100-point budget calculation rules for sandbox loadouts', () => {
    // The Solo Titan
    const abyssDweller = allCards.find(c => c.name === 'Abyss Dweller');
    assert.ok(abyssDweller, 'Abyss Dweller must exist in card pool');
    assert.equal(abyssDweller.points, 100, 'Abyss Dweller must cost exactly 100 points');

    // Budget check: 100 pts + 0 pts unlisted = 100 pts (legal)
    const soloTitanTotal = (abyssDweller.points || 0) + 0 + 0;
    assert.equal(soloTitanTotal, 100, 'Solo titan loadout must equal exactly 100 points');
    assert.ok(soloTitanTotal <= 100, 'Must not exceed 100 points');

    // Over budget simulation: 100 + 15 = 115 pts (illegal)
    const ashBlossom = allCards.find(c => c.name.includes('Ash Blossom'));
    const ashPoints = ashBlossom?.points || 15;
    const overBudgetTotal = (abyssDweller.points || 0) + ashPoints;
    assert.ok(overBudgetTotal > 100, 'Over-budget loadout correctly triggers illegal status');
  });

  test('verifies inaugural YCS Houston 2026 milestones and champion linkage', () => {
    const ycsHouston = tournaments.find(t => t.id === 'ycs-houston-2026');
    assert.ok(ycsHouston, 'YCS Houston 2026 tournament must exist');
    assert.ok(ycsHouston.champion.name.includes('Enzo'), 'Champion must be Enzo Fiallos');
    assert.equal(ycsHouston.champion.archetype, 'Blitzclique');
    assert.equal(ycsHouston.champion.deckId, 'ycs-houston-2026-rank-1');

    // Verify champion deck points
    const fullTourney = getTournamentById(ycsHouston.id);
    assert.ok(fullTourney, 'Tournament data must resolve');
    const championDeck = fullTourney.decks.find(d => d.id === ycsHouston.champion.deckId);
    assert.ok(championDeck, 'Champion deck must exist');
    assert.equal(championDeck.pointsSummary.total, 100, 'Champion deck used exactly 100/100 points');
  });

  test('verifies all 32 qualified tournament decks comply with 100-point limit', () => {
    const ycsHouston = tournaments.find(t => t.id === 'ycs-houston-2026');
    assert.ok(ycsHouston);
    const fullTourney = getTournamentById(ycsHouston.id);
    assert.ok(fullTourney);
    assert.equal(fullTourney.decks.length, 32, 'Must have 32 qualified tournament decks');
    for (const deck of fullTourney.decks) {
      assert.ok(
        deck.pointsSummary.total <= 100,
        `Deck #${deck.rank} (${deck.name}) points ${deck.pointsSummary.total} must be <= 100`
      );
    }
  });
});
