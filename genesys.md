# COMMISSION: GENESYS — POINT FORGE
**To:** Deputy Gemini  
**From:** MAJO, Executive Commission  
**Principal:** Egg  
**Priority:** Deliver a working, polished webapp — not merely a concept or mockup.

## 1. Mission

Build a complete, playable-in-the-browser Yu-Gi-Oh! TCG GENESYS deck-building webapp that makes the format's point-based deck construction understandable, strategic, and enjoyable.

Official reference: https://www.yugioh-card.com/en/genesys/

Card data and image integration: https://ygoprodeck.com/api-guide/

The fundamental product thesis:

**Keep the flexibility of Genesys, but give players the clarity of a well-designed Forbidden & Limited List.**

Traditional formats communicate deck restrictions using three familiar statuses: Forbidden, Limited, and Semi-Limited. Genesys replaces that approach with points. We want to preserve the official point system while making the implications of those points easy to understand.

Do not simply dump the official points spreadsheet into a searchable card gallery. Build a genuinely useful deck-building experience.

## 2. Core design concept: a strategic point budget

The default deck-building budget is 100 points. Allow users to change the cap to accommodate tournaments with custom point limits.

The app should help users understand not just what a card costs, but what that cost means for their deck.

Organize cards into intuitive, filterable point tiers:

- **Free — 0 points:** Cards that cost no points under the selected official data source.
- **Low investment — 1–10 points:** Affordable options that compete for a small part of the budget.
- **Moderate investment — 11–25 points:** Cards that require a deliberate budget choice.
- **High investment — 26–50 points:** Powerful cards that meaningfully constrain other choices.
- **Premium investment — 51–99 points:** Cards that consume most of the budget.
- **Budget-defining — 100+ points:** Cards that consume or exceed a standard 100-point budget, depending on the event cap.

These are proposed UI groupings, not official Konami classifications. Make them configurable and display the actual official point cost prominently. Never change a card's official cost to fit our categories.

The important design principle is that a point tier describes a budget commitment, not an unsupported claim about a card's competitive strength.

## 3. Make the point system make sense

Build a deck dashboard that continuously communicates:

- Total points used and remaining.
- Percentage of the available budget consumed.
- Which cards are responsible for the largest commitments.
- How many points are allocated to the Main Deck, Extra Deck, and Side Deck.
- Which cards can be added without exceeding the cap.
- What happens to the available budget when a card's quantity changes.

For example, if a player adds a 33-point card three times, the interface must show a 99-point commitment from those copies, not 33 points.

The budget calculation must include all cards in all three deck sections combined.

Create a visual point-allocation breakdown that helps players recognize when one card or a small group of cards consumes most of their resources.

Provide a clear distinction between:
- Official card point cost.
- Total points contributed by the selected quantity.
- The player's remaining budget.
- The card's traditional Advanced Format status, where relevant.

## 4. Make traditional restrictions understandable

Create an optional Advanced Format reference overlay using the official Forbidden & Limited List.

Players should be able to see whether a card is traditionally:
- Forbidden.
- Limited.
- Semi-Limited.
- Unlimited.

This is an educational reference layer, NOT a restriction that gets applied to Genesys deck validation.

A card forbidden in Advanced Format can still be legal in Genesys if it meets the Genesys rules and point cap.

The app should make this distinction intuitive. For example, a card can carry a visible "Forbidden in Advanced" reference badge while remaining legal to add to a Genesys deck.

Use authoritative, maintained data sources for these statuses. Show the applicable list date or version, and avoid silently treating stale data as current.

## 5. YGOPRODeck integration

Use the documented YGOPRODeck API v7:

https://db.ygoprodeck.com/api/v7/cardinfo.php

Investigate the official API parameters, particularly the Genesys format data.

YGOPRODeck documents the `genesys_points` field when querying the `genesys` format, and exposes card image URLs and alternate artworks.

Requirements:

- Search cards by name.
- Display card artwork, name, type, and relevant card information.
- Support filtering by archetype, card type, attribute, and point tier.
- Show official Genesys points next to each card.
- Support alternative artwork selection when available.
- Provide a useful card detail view.
- Cache data appropriately and respect API rate limits.
- Follow YGOPRODeck's image usage guidance. Do not continuously hotlink large volumes of images; investigate permitted local caching and hosting options.
- Handle API failures gracefully without losing the player's current deck.

Do not invent point values for missing records. Clearly flag missing or stale data, and distinguish official data from any locally configured values.

## 6. Deck-building experience

The primary screen should combine card discovery with an immediately visible deck workspace.

A player should be able to:

1. Search or filter the card catalog.
2. Inspect a card and its point cost.
3. Add or remove copies using simple controls.
4. Organize cards into Main, Extra, and Side Deck sections.
5. See point totals update immediately.
6. Receive clear feedback when the deck exceeds its point budget.
7. Save and reopen deck lists.
8. Export a deck in a useful, interoperable format.

Enforce the Genesys maximum of three copies of any card across the combined deck, where applicable. Exclude Link and Pendulum Monsters. Do not apply the traditional Advanced Forbidden & Limited restrictions as Genesys legality rules.

Support standard deck-size validation and clearly explain any invalid deck configuration. Keep event-specific rules configurable instead of hardcoding every assumption.

## 7. Make it useful for real players

Include the following usability features where feasible:

- Quick-add controls and quantity editing.
- Filters for zero-point cards and affordable alternatives.
- Sorting by point cost, name, and card type.
- Deck search and duplicate detection.
- Clear empty, loading, and error states.
- Responsive desktop and mobile layouts.
- Persistent local deck storage.
- Import/export support, ideally including YDK and a human-readable deck summary.
- A printable deck report showing point totals and card quantities.

The product should help users answer practical questions:

"What can I build with 100 points?"

"Which cards are eating my budget?"

"If I remove this expensive card, what options open up?"

"Which cards are free, and which are competing for my limited points?"

Do not promise automated competitive recommendations unless the underlying data supports them.

## 8. Technical and visual direction

Use a maintainable, conventional web stack suitable for a standalone application. Choose the implementation details yourself, provided the result is easy to run locally and straightforward to extend.

The interface should feel like a polished competitive deck-building tool: dark card-table surfaces, legible typography, vivid card art, restrained accent colors, and clear budget visualization.

Prioritize usability over decorative complexity. The card images should be central to discovery, but the point budget must remain visible.

Avoid building an unnecessary backend or requiring paid infrastructure for basic local use. Do not require an account merely to build and save a local deck.

## 9. Acceptance criteria

The commission is not complete until the following are verified:

1. The app launches using documented instructions.
2. Card search returns usable results with card artwork.
3. Official Genesys points are displayed accurately against the selected source.
4. Quantities correctly multiply the point cost.
5. Main, Extra, and Side Deck costs contribute to one shared budget.
6. The maximum-copy rule is enforced across sections.
7. Link and Pendulum Monsters cannot be added to a legal Genesys deck.
8. Advanced Format statuses appear only as a reference overlay.
9. The app distinguishes a budget violation from a format-legality violation.
10. Saving and reopening a deck works.
11. Exported deck data is checked for correctness.
12. Missing API data, network failures, and invalid deck states are handled gracefully.
13. The main workflow works at desktop and mobile sizes.
14. Core calculations and rules are covered by automated tests.

Test at least one deck below the cap, one exactly at the cap, one above the cap, one deck containing multiple copies of a point-valued card, and one deck containing an otherwise forbidden Advanced Format card that remains legal under Genesys rules.

## 10. Deliverables

Deliver a complete implementation, not a design proposal.

Include:
- The working application and source code.
- A README with setup and launch instructions.
- An explanation of the data sources and refresh strategy.
- Automated tests and a verification report.
- A small number of example decks demonstrating different point-budget strategies.
- A list of known limitations and any remaining integration issues.

Use your implementation discretion. Make sensible decisions without waiting for approval on every minor detail.

**Final directive:** Build the thing. The product succeeds when a new or returning duelist can understand Genesys, construct a valid deck, and make informed choices about their point budget without needing to decipher a raw list of card costs.