import { describe, it } from 'node:test';
import assert from 'node:assert';
import cardsRaw from '../data/cards.json';
import { Card } from '../types/card';

const cards: Card[] = cardsRaw as Card[];

describe('GENESYS Point List Visualizer - Official Point Data Integrity', () => {
  it('correctly indexes all 750 official point-bearing cards', () => {
    const pointCards = cards.filter(c => (c.points || 0) > 0);
    assert.strictEqual(pointCards.length, 750, 'Must have exactly 750 point-bearing cards from official Genesys list');
  });

  it('displays exact official point values for format-defining cards', () => {
    const cardMap = new Map(cards.map(c => [c.name.toLowerCase(), c]));

    const testCases: Array<[string, number]> = [
      ['skill drain', 100],
      ['abyss dweller', 100],
      ['maxx "c"', 50],
      ['albion the sanctifire dragon', 33],
      ['a hero lives', 30],
      ['pot of greed', 20],
      ['called by the grave', 20],
      ['ash blossom & joyous spring', 18],
      ['harpie\'s feather duster', 7],
      ['effect veiler', 7],
      ['heavy storm', 4],
      ['raigeki', 2],
      ['monster reborn', 2],
      ['break sword', 1],
    ];

    for (const [name, expectedPoints] of testCases) {
      const card = cardMap.get(name) || cards.find(c => c.name.toLowerCase().includes(name));
      assert.ok(card, `Card "${name}" must exist in the database`);
      assert.strictEqual(card?.points, expectedPoints, `Card "${name}" must have exactly ${expectedPoints} points`);
    }
  });

  it('correctly represents unlisted standard cards as 0 points', () => {
    const zeroCards = ['blue-eyes white dragon', 'dark magician', 'cyber dragon', 'mystical space typhoon'];
    for (const name of zeroCards) {
      const card = cards.find(c => c.name.toLowerCase() === name);
      assert.ok(card, `Card "${name}" must exist`);
      assert.strictEqual(card?.points, 0, `Unlisted standard card "${name}" must have 0 points`);
    }
  });

  it('verifies card images point to YGOPRODeck CDN', () => {
    for (const card of cards.slice(0, 50)) {
      assert.ok(card.images && card.images.length > 0, `Card ${card.name} must have images`);
      const img = card.images[0];
      assert.ok(img.image_url.includes('ygoprodeck.com'), 'Must use YGOPRODeck CDN image URL');
      assert.ok(img.image_url_small.includes('ygoprodeck.com'), 'Must use YGOPRODeck CDN small image URL');
    }
  });
});

describe('GENESYS Point List Visualizer - Search and Filter Logic', () => {
  it('searches cards by partial name and case-insensitively', () => {
    const query = 'ash blossom';
    const matches = cards.filter(c => c.name.toLowerCase().includes(query));
    assert.ok(matches.length >= 1, 'Must find Ash Blossom');
    assert.strictEqual(matches[0].name, 'Ash Blossom & Joyous Spring');
  });

  it('filters by point range: 100 points', () => {
    const cards100 = cards.filter(c => (c.points || 0) >= 100);
    assert.ok(cards100.length > 0, 'Must have cards with 100 points');
    for (const c of cards100) {
      assert.ok(c.points >= 100, `Card ${c.name} must be >= 100 points`);
    }
  });

  it('filters by point range: 50–99 points', () => {
    const cards50to99 = cards.filter(c => (c.points || 0) >= 50 && (c.points || 0) < 100);
    assert.ok(cards50to99.length > 0, 'Must have cards with 50-99 points');
    for (const c of cards50to99) {
      assert.ok(c.points >= 50 && c.points < 100);
    }
  });

  it('filters by point range: 1–9 points', () => {
    const cards1to9 = cards.filter(c => (c.points || 0) >= 1 && (c.points || 0) < 10);
    assert.ok(cards1to9.length > 0, 'Must have cards with 1-9 points');
    for (const c of cards1to9) {
      assert.ok(c.points >= 1 && c.points < 10);
    }
  });

  it('sorts accurately by points descending (highest first)', () => {
    const sorted = [...cards].sort((a, b) => (b.points || 0) - (a.points || 0));
    assert.strictEqual(sorted[0].points, 100, 'First card must have highest point value (100)');
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok((sorted[i].points || 0) >= (sorted[i + 1].points || 0), 'Must be sorted in descending order');
    }
  });

  it('sorts accurately by points ascending (lowest first)', () => {
    const sorted = [...cards].sort((a, b) => (a.points || 0) - (b.points || 0));
    assert.strictEqual(sorted[0].points, 0, 'First card must have 0 points');
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok((sorted[i].points || 0) <= (sorted[i + 1].points || 0), 'Must be sorted in ascending order');
    }
  });

  it('sorts alphabetically by name', () => {
    const sorted = [...cards].sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok(sorted[i].name.localeCompare(sorted[i + 1].name) <= 0, 'Must be sorted in alphabetical order');
    }
  });

  it('accurately calculates official point bracket distribution counts', () => {
    const p100 = cards.filter(c => (c.points || 0) >= 100).length;
    const p50to99 = cards.filter(c => (c.points || 0) >= 50 && (c.points || 0) < 100).length;
    const p25to49 = cards.filter(c => (c.points || 0) >= 25 && (c.points || 0) < 50).length;
    const p10to24 = cards.filter(c => (c.points || 0) >= 10 && (c.points || 0) < 25).length;
    const p1to9 = cards.filter(c => (c.points || 0) >= 1 && (c.points || 0) < 10).length;
    const p0 = cards.filter(c => (c.points || 0) === 0).length;
    const totalPointBearing = cards.filter(c => (c.points || 0) > 0).length;

    assert.strictEqual(p100, 105, '100 pt bracket must contain 105 cards');
    assert.strictEqual(p50to99, 75, '50-99 pt bracket must contain 75 cards');
    assert.strictEqual(p25to49, 76, '25-49 pt bracket must contain 76 cards');
    assert.strictEqual(p10to24, 241, '10-24 pt bracket must contain 241 cards');
    assert.strictEqual(p1to9, 253, '1-9 pt bracket must contain 253 cards');
    assert.strictEqual(p0, 502, '0 pt unlisted cards must contain 502 cards');
    assert.strictEqual(totalPointBearing, 750, 'Total point bearing must be 750');
    assert.strictEqual(cards.length, 1252, 'Database total must be 1252');
  });

  it('guarantees unique IDs across paginated subsets and prevents duplicate keys', () => {
    const page1 = cards.slice(0, 48);
    const page2 = cards.slice(48, 96);
    const seen = new Set<number>();

    for (const card of page1) {
      assert.ok(!seen.has(card.id), `ID ${card.id} must be unique in page 1`);
      seen.add(card.id);
    }

    for (const card of page2) {
      assert.ok(!seen.has(card.id), `ID ${card.id} must be unique across page 1 and page 2`);
      seen.add(card.id);
    }
  });
});

