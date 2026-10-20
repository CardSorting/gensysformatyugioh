import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getKnownCard, getAllKnownCards, resolveCardDetails } from '@/lib/card-lookup';

test('Card Inspector & Unified Card Lookup - World-Class Ergonomics', async (t) => {
  await t.test('indexes over 1,000 official format and tournament cards', () => {
    const all = getAllKnownCards();
    assert.ok(all.length >= 1000, `Expected at least 1000 cards, got ${all.length}`);
  });

  await t.test('resolves point-bearing cards with official points and full card text', () => {
    // Pot of Greed: 55144522
    const potOfGreed = getKnownCard(55144522);
    assert.ok(potOfGreed, 'Pot of Greed should be found in local index');
    assert.equal(potOfGreed.name, 'Pot of Greed');
    assert.equal(potOfGreed.points, 20);
    assert.ok(potOfGreed.desc.includes('Draw 2 cards'), 'Pot of Greed should have complete card text');

    // Ash Blossom & Joyous Spring: 14558127
    const ash = getKnownCard(14558127);
    assert.ok(ash, 'Ash Blossom should be found in local index');
    assert.equal(ash.points, 18);
    assert.ok(ash.desc.length > 50, 'Ash Blossom should have complete effect text');
    assert.equal(ash.atk, 0);
    assert.equal(ash.def, 1800);
    assert.equal(ash.level, 3);
  });

  await t.test('resolves 0-point unlisted tournament cards with complete effect text & stats', () => {
    // Thunder King, the Lightningstrike Kaiju: 48770333
    const thunderKing = getKnownCard(48770333);
    assert.ok(thunderKing, 'Thunder King Kaiju should be found in tournament metadata');
    assert.equal(thunderKing.name, 'Thunder King, the Lightningstrike Kaiju');
    assert.equal(thunderKing.points, 0);
    assert.ok(!thunderKing.desc.startsWith('Official tournament card'), 'Desc must not be a placeholder stub');
    assert.ok(thunderKing.desc.includes('Special Summon this card'), 'Desc must contain real effect text');
    assert.equal(thunderKing.atk, 3300);
    assert.equal(thunderKing.def, 2100);
    assert.equal(thunderKing.level, 9);
    assert.equal(thunderKing.race, 'Thunder');
    assert.equal(thunderKing.attribute, 'LIGHT');

    // Vortex Trooper: 7736719
    const vortexTrooper = getKnownCard(7736719);
    assert.ok(vortexTrooper, 'Vortex Trooper should be found');
    assert.equal(vortexTrooper.name, 'Vortex Trooper');
    assert.ok(vortexTrooper.desc.includes('shuffle 2 cards from your hand'), 'Vortex Trooper effect must be present');
    assert.equal(vortexTrooper.atk, 0);
    assert.equal(vortexTrooper.def, 600);

    // Crackle Blitzclique: 58916810
    const crackle = getKnownCard(58916810);
    assert.ok(crackle, 'Crackle Blitzclique should be found');
    assert.ok(crackle.desc.length > 20, 'Crackle Blitzclique effect must be populated');
  });

  await t.test('resolves cards case-insensitively by name', () => {
    const byName = getKnownCard(null, 'pot of greed');
    assert.ok(byName, 'Should find card by lowercase name');
    assert.equal(byName.id, 55144522);

    const kaiju = getKnownCard(null, 'thunder king, the lightningstrike kaiju');
    assert.ok(kaiju, 'Should find Kaiju by lowercase name');
    assert.equal(kaiju.id, 48770333);
  });

  await t.test('resolveCardDetails returns full card object', async () => {
    const card = await resolveCardDetails(48770333, 'Thunder King, the Lightningstrike Kaiju');
    assert.ok(card, 'resolveCardDetails should return card');
    assert.equal(card.name, 'Thunder King, the Lightningstrike Kaiju');
    assert.ok(card.desc.includes('Kaiju Counters'));
    assert.equal(card.atk, 3300);
  });
});
