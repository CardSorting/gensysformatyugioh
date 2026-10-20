import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log("Fetching complete Genesys dataset from YGOPRODeck API...");
  const res = await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?format=genesys&misc=yes");
  if (!res.ok) {
    throw new Error(`Failed to fetch cards: ${res.statusText}`);
  }
  const json = await res.json();
  const allCards = json.data || [];
  console.log(`Received ${allCards.length} cards.`);

  const cleanCard = (c) => {
    const misc = c.misc_info?.[0] || {};
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      frameType: c.frameType,
      humanReadableCardType: c.humanReadableCardType,
      desc: c.desc,
      race: c.race,
      archetype: c.archetype || null,
      attribute: c.attribute || null,
      atk: typeof c.atk === 'number' ? c.atk : null,
      def: typeof c.def === 'number' ? c.def : null,
      level: typeof c.level === 'number' ? c.level : null,
      scale: typeof c.scale === 'number' ? c.scale : null,
      linkval: typeof c.linkval === 'number' ? c.linkval : null,
      points: Number(misc.genesys_points || 0),
      ban_tcg: c.banlist_info?.ban_tcg || null,
      images: (c.card_images || []).map(img => ({
        id: img.id,
        image_url: img.image_url,
        image_url_small: img.image_url_small,
        image_url_cropped: img.image_url_cropped
      }))
    };
  };

  // 1. All point cards (points > 0)
  const pointCards = allCards
    .filter(c => (c.misc_info?.[0]?.genesys_points || 0) > 0)
    .map(cleanCard);

  console.log(`Point cards found: ${pointCards.length}`);

  // 2. Curated staple 0-point cards (spells, traps, monsters, extra deck)
  const stapleNames = new Set([
    "Blue-Eyes White Dragon",
    "Dark Magician",
    "Red-Eyes Black Dragon",
    "Exodia the Forbidden One",
    "Right Arm of the Forbidden One",
    "Left Arm of the Forbidden One",
    "Right Leg of the Forbidden One",
    "Left Leg of the Forbidden One",
    "Mystical Space Typhoon",
    "Book of Moon",
    "Dark Hole",
    "Mirror Force",
    "Torrential Tribute",
    "Bottomless Trap Hole",
    "Compulsory Evacuation Device",
    "Solemn Judgment",
    "Solemn Warning",
    "Solemn Strike",
    "Effect Veiler",
    "Ghost Ogre & Snow Rabbit",
    "Ghost Belle & Haunted Mansion",
    "Ghost Mourner & Moonlit Chill",
    "Droll & Lock Bird",
    "Dimension Shifter",
    "Nibiru, the Primal Being",
    "Gameciel, the Sea Turtle Kaiju",
    "Kumongous, the Sticky String Kaiju",
    "Super Polymerization",
    "Lightning Storm",
    "Evenly Matched",
    "Forbidden Droplet",
    "Cosmic Cyclone",
    "Twin Twisters",
    "Foolish Burial",
    "One for One",
    "Reinforcement of the Army",
    "Allure of Darkness",
    "Polymerization",
    "Instant Fusion",
    "Ready Fusion",
    "Elemental HERO Stratos",
    "Elemental HERO Shadow Mist",
    "Elemental HERO Sunrise",
    "Masked HERO Dark Law",
    "Stardust Dragon",
    "Black Rose Dragon",
    "Trishula, Dragon of the Ice Barrier",
    "Baronne de Fleur",
    "Borreload Savage Dragon",
    "Number 39: Utopia",
    "Number S39: Utopia the Lightning",
    "Castel, the Skyblaster Musketeer",
    "Tornado Dragon",
    "Divine Arsenal AA-ZEUS - Sky Thunder",
    "Time Thief Redoer",
    "Evilswarm Exciton Knight",
    "Dingirsu, the Orcust of the Evening Star",
    "I:P Masquerena",
    "Knightmare Phoenix",
    "Knightmare Unicorn",
    "Accesscode Talker",
    "Apollousa, Bow of the Goddess",
    "Timegazer Magician",
    "Stargazer Magician",
    "Performapal Pendulum Sorcerer",
    "Odd-Eyes Pendulum Dragon",
    "Astrograph Sorcerer",
    "Swords of Revealing Light",
    "Magic Cylinder",
    "Cyber Dragon",
    "Jinzo",
    "Sangan",
    "Witch of the Black Forest",
    "Morphing Jar",
    "Man-Eater Bug",
    "Gorz the Emissary of Darkness",
    "Tragoedia",
    "Battle Fader",
    "Swift Scarecrow"
  ]);

  const pointCardIds = new Set(pointCards.map(c => c.id));
  const additionalStaples = allCards
    .filter(c => !pointCardIds.has(c.id) && stapleNames.has(c.name))
    .map(cleanCard);

  console.log(`Additional staple cards: ${additionalStaples.length}`);

  // Also include top rated/staple cards from the format to give users ~1200 high-value cards immediately
  const otherPopular = allCards
    .filter(c => !pointCardIds.has(c.id) && !stapleNames.has(c.name) && (c.misc_info?.[0]?.views || 0) > 300000)
    .slice(0, 450)
    .map(cleanCard);

  console.log(`Other popular format cards: ${otherPopular.length}`);

  const combinedCards = [...pointCards, ...additionalStaples, ...otherPopular];
  console.log(`Total bundled database cards: ${combinedCards.length}`);

  const outPath = path.resolve('src/data/cards.json');
  fs.writeFileSync(outPath, JSON.stringify(combinedCards, null, 2), 'utf-8');
  console.log(`Saved cards to ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch(err => {
  console.error("Error fetching cards:", err);
  process.exit(1);
});
