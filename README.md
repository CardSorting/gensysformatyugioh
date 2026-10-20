# GENESYS POINT LIST VISUALIZER
> **A lightweight, visually polished webapp making the official Yu-Gi-Oh! Genesys point list easy to browse.**  
> *Official Source:* [https://www.yugioh-card.com/en/genesys/](https://www.yugioh-card.com/en/genesys/)  
> *Card Images & Metadata:* [https://ygoprodeck.com/api-guide/](https://ygoprodeck.com/api-guide/)

---

## 1. Overview & Objective

The official **Yu-Gi-Oh! GENESYS** format replaces the traditional Forbidden & Limited list with an underlying point system. Konami publishes an official list of point-cost cards in raw text/table format.

**GENESYS Point List Visualizer** is a clean, modern visual companion to the official Genesys page. It transforms the raw point list into a searchable, filterable, and responsive visual card gallery:
- **Exact Official Points**: Every card displays its exact official point value faithfully without translation, distortion, or invented restriction categories.
- **High-Resolution Artwork**: Card images and metadata retrieved via the YGOPRODeck API.
- **Instant Search & Range Filtering**: Search cards by name, archetype, or effect text; filter by official point tiers or custom point ranges.
- **Card Inspection**: Simple, focused card detail view showing full artwork, card text, official point values, and format source links.
- **Responsive & Lightweight**: Designed for instant mobile and desktop browsing with zero onboarding and low hosting overhead.

---

## 2. Official Format Point Distribution

The official Genesys database contains **750 point-bearing cards** (ranging from 1 to 100 points) alongside standard 0-point unlisted cards:

| Point Bracket | Card Count | Notable Examples |
| :--- | :---: | :--- |
| **100 Points** | 105 cards | *Skill Drain* (100), *Abyss Dweller* (100), *Zaborg the Mega Monarch* (100) |
| **50–99 Points** | 52 cards | *Maxx "C"* (50), *Saryuja Skull Dread* (60), *Inspector Boarder* (50) |
| **25–49 Points** | 86 cards | *Albion the Sanctifire Dragon* (33), *A Hero Lives* (30), *Agido* (33) |
| **10–24 Points** | 184 cards | *Ash Blossom & Joyous Spring* (18), *Pot of Greed* (20), *Called by the Grave* (20) |
| **1–9 Points** | 323 cards | *Harpie's Feather Duster* (7), *Effect Veiler* (7), *Raigeki* (2), *Monster Reborn* (2) |
| **0 Points (Unlisted)** | Remainder | *Blue-Eyes White Dragon*, *Dark Magician*, *Cyber Dragon*, *Mystical Space Typhoon* |

*Note: In accordance with official Genesys rules, Link and Pendulum monsters are prohibited from the format.*

---

## 3. Quickstart & Launch Instructions

### Prerequisites
- **Node.js**: v18.0.0+ (Tested on v26.8.1)
- **npm**: v9.0.0+ (Tested on v11.19.0)

### 1. Installation
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Run Linter
```bash
npm run lint
```

---

## 4. World-Class Ergonomics & Navigation

Mirroring UX patterns from top card databases (Scryfall, Moxfield, YGOPRODeck) and modern productivity tools (Linear):

### ⊞ / ☰ 1. Dual View Modes (Grid & Compact Table)
- **Visual Grid Mode**: Artwork-first layout with glowing point badges, card type, and responsive card sizing.
- **Compact Table / Spreadsheet Mode**: High-density table with mini-thumbnails, card name, official points, card type, attribute, Level/Rank/Scale, and ATK/DEF. Built for tournament players and power users scanning through the 750 point-bearing cards with zero scrolling fatigue.
- View preference persists in the URL and across page refreshes.

### 🔗 2. URL State Synchronization
- All search queries, point filters, sorting criteria, and view modes automatically synchronize with the URL (`?q=ash&points=10-24&sort=points-desc&view=table`).
- Users can bookmark specific views, use browser back/forward buttons seamlessly, or click **"🔗 Share View"** to copy a direct shareable link with an instant toast notification.

### 🏷️ 3. Live Bracket Distribution Badges
- Filter chips display exact live card counts calculated directly from the official Genesys database:
  - `⭐ Official List (750)`
  - `100 pts (105)`
  - `50–99 pts (75)`
  - `25–49 pts (76)`
  - `10–24 pts (241)`
  - `1–9 pts (253)`
  - `0 pts (502)`
  - `All Cards (1,252)`

### ⚡ 4. Keyboard Navigation & Cycling Ergonomics
- **Search Focus**: Press `/` from anywhere on the page to jump focus to the search bar.
- **Card Modal Cycling**: Navigate cards sequentially inside the inspection modal using `ArrowLeft` (←) and `ArrowRight` (→) or on-screen buttons without having to close and reopen.
- **Escape Acceleration**: Press `Esc` to instantly close modals or return to the main gallery.
- **1-Click Copy Link**: "📋 Copy Link" button inside the modal and standalone page (`/card/[id]`) with animated toast feedback.

---

## 5. 🏆 Long-Lived Tournament Archive & World-Class URL Schema

Mirroring architecture from premier competitive card platforms (Limitless TCG, Moxfield, MTGGoldfish, Liquipedia), the application supports an extensible multi-tournament registry displaying tournaments and decks throughout time:

### 🌐 Hierarchical URL Schema & Page Routing
| Route | Page / Feature Description |
| :--- | :--- |
| `/tournaments` | **Tournaments Directory Hub**: Comprehensive archive of all Genesys championship events throughout time, searchable by year, tier, location, format, and champion. |
| `/tournaments/[tournamentId]` | **Tournament Showcase & Deck Directory**: Event header, date, location, champion spotlight, metagame breakdown, filterable deck cards, and event switcher. |
| `/tournaments/[tournamentId]/bracket` | **Dynamic Playoff Bracket**: Single-elimination tree (Quarterfinals → Semifinals → Finals or Semifinals → Finals) with scores, winner highlights, and clickable card thumbnails. |
| `/tournaments/[tournamentId]/decks/[deckId]` | **Canonical Decklist Page**: Full breadcrumb navigation, dual view modes (`[ ⊞ Visual Cardboard ]` / `[ ☰ Text / Deck Sheet ]`), Genesys 100-pt budget meter, high point investments, simulator `.ydk` download, text export, and prev/next deck cycling. |
| `/decks` | **Competitive Decks Archive Hub**: Filter and search all top-cut decks across all tournaments, with tournament switcher dropdown. |
| `/decks/[id]` | **Universal Deck Shortcut**: Auto-resolves any deck across registered tournaments (e.g. `/decks/1` or `/decks/ycs-houston-2026-rank-1` or `/decks/giant-card-houston-2026-rank-1`) and renders with full tournament context. |
| `/bracket` | **Global Bracket Shortcut**: Quick access to the latest premier tournament bracket with event switcher. |

---

### 🎴 Registered Official Tournaments
1. **YCS Houston 2026 Genesys Main Event (Top 32)**:
   - Source: [Konami Coverage Blog](https://yugiohblog.konami.com/2026/ycs/ycs-houston-genesys-main-event-top-32-deck-lists/)
   - Champion: **Enzo Maximiliano Fiallos Velasco** (Blitzclique)
   - Finalist: **Juan Sebastian Andrade Castro** (Angelechy)
   - Route: `/tournaments/ycs-houston-2026`
2. **Sunday's Genesys ATTACK OF THE GIANT CARD!! (Top 4)**:
   - Source: [Konami Coverage Blog](https://yugiohblog.konami.com/2026/ycs/sundays-genesys-attack-of-the-giant-card-top-4/)
   - Champion: **Jasper Martin** (Predaplant True Draco)
   - Finalist: **Dwayne Howell** (Dinosaur GMX)
   - Route: `/tournaments/genesys-giant-card-houston-2026`

---

### 🛠️ Dedicated Decklist Ergonomics & Features
- **Breadcrumb Hierarchy**: `Home › Tournaments › [Tournament Title] › Decks › [Player Name]`
- **Dual Deckboard Views**:
  - `[ ⊞ Visual Cardboard ]`: Visual high-res card grid with card artwork, quantities (`3x`), and individual point cost badges (`50p`, `15p`, `5p`, `0p`). Clicking ANY card opens the Card Detail Inspector modal.
  - `[ ☰ Text / Deck Sheet Checklist ]`: High-density text table view (Quantity, Card Name, Category, Point Cost, Subtotal) built for tournament deck sheet verification.
- **Interactive 100-Point Budget Meter**: Visual gauge showing Main Deck points, Extra Deck points, Side Deck points, and compliance with the official 100-pt budget cap.
- **Simulator & Export Suite**:
  - `[ 💾 Download .YDK ]`: Instant download of standard `.ydk` simulator file for EDOPro, YGO Omega, Project Ignis, and DuelingBook.
  - `[ 📋 Copy Text Decklist ]`: One-click copy with card counts and point costs.
  - `[ 🔗 Share Deck Link ]`: Copies direct canonical link.
- **Prev / Next Deck Cycling**: Seamlessly navigate through seeds (e.g. `← #1 Enzo Fiallos` | `Next: #2 Juan Andrade →`).

---

## 6. Verification & Automated Test Suite

All 27 automated tests pass with 0 errors via `npm test`:

```
▶ YCS Houston 2026 - Top 32 Decklists Data Integrity
  ✔ indexes all 32 qualified decklists from YCS Houston Genesys Main Event
  ✔ verifies champion Enzo Fiallos (Rank 1, Blitzclique)
  ✔ verifies finalist Juan Andrade (Rank 2, Angelechy)
  ✔ verifies every single deck complies with the 100-point Genesys budget cap
  ✔ verifies valid card counts across Main, Extra, and Side Decks for all players
  ✔ looks up decks correctly by exact ID and by rank number
  ✔ validates tournament elimination bracket structure and thumbnail linkages
✔ YCS Houston 2026 - Top 32 Decklists Data Integrity

▶ Multi-Tournament Architecture & Universal Deck Routing
  ✔ registers multiple official Genesys tournaments throughout time
  ✔ resolves Giant Card Houston 2026 tournament and champion Jasper Martin
  ✔ retrieves decks scoped to a specific tournament
  ✔ universally resolves any deck across all tournaments
  ✔ generates standard simulator .ydk format for export
  ✔ generates formatted text decklist with counts and point costs
  ✔ cycles adjacent decks correctly within tournament
✔ Multi-Tournament Architecture & Universal Deck Routing

▶ GENESYS Point List Visualizer - Official Point Data Integrity
  ✔ correctly indexes all 750 official point-bearing cards
  ✔ displays exact official point values for format-defining cards
  ✔ correctly represents unlisted standard cards as 0 points
  ✔ verifies card images point to YGOPRODeck CDN
✔ GENESYS Point List Visualizer - Official Point Data Integrity

▶ GENESYS Point List Visualizer - Search and Filter Logic
  ✔ searches cards by partial name and case-insensitively
  ✔ filters by point range: 100 points
  ✔ filters by point range: 50–99 points
  ✔ filters by point range: 1–9 points
  ✔ sorts accurately by points descending (highest first)
  ✔ sorts accurately by points ascending (lowest first)
  ✔ sorts alphabetically by name
  ✔ accurately calculates official point bracket distribution counts
  ✔ guarantees unique IDs across paginated subsets and prevents duplicate keys
✔ GENESYS Point List Visualizer - Search and Filter Logic
```

