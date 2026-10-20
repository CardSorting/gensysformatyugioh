# GENESYS POINT LIST VISUALIZER & TOURNAMENT HUB
> **A high-performance visual cardboard companion and metagame command center for the official Yu-Gi-Oh! Genesys format.**  
> *Official Konami Source:* [https://www.yugioh-card.com/en/genesys/](https://www.yugioh-card.com/en/genesys/) &bull; *Images & Metadata:* [YGOPRODeck API](https://ygoprodeck.com/api-guide/)

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Anycast](https://img.shields.io/badge/Edge%20Network-Cloudflare%20Global%20Anycast-F38020?style=flat-square&logo=cloudflare)](https://genesysygo.top)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-genesysygo.pages.dev-F38020?style=flat-square&logo=cloudflarepages)](https://genesysygo.pages.dev)
[![Tests](https://img.shields.io/badge/Tests-59%2F59%20Passing-emerald?style=flat-square)](https://nodejs.org/api/test.html)
[![Storage](https://img.shields.io/badge/Storage-BroccoliDB%20CAS%20Vault-green?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-amber?style=flat-square)](LICENSE)

---

## 1. Overview & Vision

The official **Yu-Gi-Oh! GENESYS** format eliminates the traditional Forbidden & Limited list in favor of an underlying **100-point deckbuilding budget**, opening up infinite strategic diversity while keeping degenerate locks in check.

**GENESYS Point List Visualizer** elevates the raw text lists and coverage blogs into an esports-grade, responsive visual platform:
- **Exact Official Points**: Every card displays its exact official point cost (1–100 pts) faithfully without distortion or invented restrictions.
- **Tournament Metagame Command Hub**: Official Top 32 decklists from **YCS Houston 2026** and **Sunday's Giant Card Event**, featuring interactive proportional distribution bars, compact visual tier grids, and competitive roster tables.
- **100-Point Budget Sandbox**: Real-time budget calculation with Main, Extra, and Side deck breakdowns.
- **Universal Card Inspector Modal**: Inspect 1,080+ cards with high-resolution artwork, official points, card type, ATK/DEF, level/rank, and full official effect text with keyboard cycling (`←` / `→`).
- **BroccoliDB CAS Vault**: Local Content-Addressed Storage engine and caching layer that guarantees zero broken images, prevents external CDN spamming, and provides instant offline resiliency.
- **Simulator Export Suite**: One-click `.YDK` downloads for EDOPro, YGO Omega, Project Ignis, and DuelingBook alongside formatted text decklists.

---

## 2. Official Format Point Distribution

The official Genesys database contains **750 point-bearing cards** (ranging from 1 to 100 points) alongside format-legal 0-point unlisted cards:

| Point Bracket | Official Count | Notable Format Staples |
| :--- | :---: | :--- |
| **100 Points** | 105 cards | *Skill Drain* (100), *Abyss Dweller* (100), *Zaborg the Mega Monarch* (100), *Vanity's Fiend* (100) |
| **50–99 Points** | 52 cards | *Maxx "C"* (50), *Saryuja Skull Dread* (60), *Inspector Boarder* (50), *Kashtira Fenrir* (50) |
| **25–49 Points** | 86 cards | *Albion the Sanctifire Dragon* (33), *A Hero Lives* (30), *Agido the Ancient Sentinel* (33) |
| **10–24 Points** | 184 cards | *Ash Blossom & Joyous Spring* (18), *Pot of Greed* (20), *Called by the Grave* (20), *Droll & Lock Bird* (10) |
| **1–9 Points** | 323 cards | *Harpie's Feather Duster* (7), *Effect Veiler* (7), *Raigeki* (2), *Monster Reborn* (2), *Nibiru* (5) |
| **0 Points (Unlisted)** | Remainder | *Blue-Eyes White Dragon*, *Dark Magician*, *Cyber Dragon*, *Mystical Space Typhoon* |

> [!NOTE]
> In accordance with official Genesys format invariants, Link and Pendulum monsters are prohibited from the format.

---

## 3. World-Class Ergonomics & Architecture

### 🎴 1. Dual View Modes & URL State Synchronization
- **Visual Cardboard Grid**: Artwork-first layout with glowing point cost badges, card types, and responsive scaling.
- **High-Density Spreadsheet Table**: Compact table with mini-thumbnails, official points, ATK/DEF, stats, and quick inspection triggers. Built for competitive players scanning 750 cards with zero scrolling fatigue.
- **Synchronized State**: All searches, filters, sorting options, and view modes automatically synchronize with the URL query parameters (`?q=ash&points=10-24&view=table`) and support direct link sharing.

### ⚡ 2. Metagame Command Hub & Tournament Showcase
- **Proportional Segmented Metagame Bar**: Proportional share visualization across all qualified archetypes with live hover tooltips and instant 1-click roster filtering.
- **Ergonomic Visual Tier Strip**: Compressed from ~1,400px down to ~240px, categorizing archetypes into Tier 1, Tier 1.5, Tier 2, and Rogue Tech innovations with glowing active rings and 1-click dismiss pills.
- **Unified Sticky Control HUD**: 44px sticky bar merging keyword search, placement filters (`All (32)`, `🏆 Champ`, `Top 4`, `Top 8`, `Top 16`), active strategy tags, and view toggles.
- **Dynamic Playoff Brackets**: Interactive elimination bracket tree with match scores, winner highlights, and clickable deck cards.

### 🔍 3. Universal Card Inspector Modal
- Press `/` from anywhere to focus search.
- Press `⌘K` to open the Command Palette.
- Click any card chip or artwork to open the Card Detail Inspector with full card effects, points, and archetype linkages.
- Navigate sequentially with `ArrowLeft` (←) and `ArrowRight` (→) or press `Esc` to close.

### 🛡️ 4. BroccoliDB CAS Vault & BroccoliQueue
- **Content-Addressed Storage (CAS)**: SHA-256 binary blob storage caching card images locally in `/api/images/[type]/[id]`.
- **Zero Broken Images**: Integrated SVG fallback card generator for missing or corrupted images.
- **BroccoliQueue**: Durable in-process background job queue engine with worker concurrency, prefetching, and live dashboard monitoring (`/api/queue`).

---

## 4. Hierarchical Route Directory

| Route | Page / Feature Description |
| :--- | :--- |
| `/` | **Interactive Welcome Experience**: Format ontology map, 100-pt budget sandbox, visual paradigm shift, classic field visualizer, and FAQ accordion. |
| `/cards` | **Official Point List Visualizer**: Searchable, filterable gallery of all 750 point-bearing cards and 0-point tournament staples with dual grid/table views. |
| `/card/[id]` | **Dedicated Card Page**: Canonical card view with high-res art, full effect text, point cost, and direct tournament deck usage references. |
| `/tournaments` | **Championship Tournaments Directory**: Archive of all official Genesys events, searchable by year, tier, location, and format. |
| `/tournaments/[tournamentId]` | **Tournament Command Hub**: YCS Houston 2026 Top 32 showcase, proportional metagame bar, tier matrix, filter HUD, and deck cards. |
| `/tournaments/[tournamentId]/bracket` | **Playoff Bracket**: Single-elimination tournament tree with match progression and player links. |
| `/tournaments/[tournamentId]/decks/[deckId]` | **Canonical Tournament Decklist**: Visual cardboard grid + deck sheet checklist, 100-pt budget split gauge, and `.YDK` export. |
| `/decks` | **Top-Cut Decks Archive**: Multi-tournament decklist browser. |
| `/decks/[id]` | **Universal Deck Shortcut**: Auto-resolves any deck ID across all events. |
| `/bracket` | **Global Bracket Shortcut**: Quick access to the latest championship playoff bracket. |

---

## 5. Quickstart & Development

### Prerequisites
- **Node.js**: v18.0.0+ (Tested on v26.8.1)
- **npm**: v9.0.0+ (Tested on v11.19.0)

### 1. Installation
```bash
git clone https://github.com/CardSorting/gensysformatyugioh.git
cd gensysformatyugioh
npm install
```

### 2. Launch Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Test Suite (58 Tests)
```bash
npm test
```

### 4. Run Linter
```bash
npm run lint
```

### 5. Production Build (Turbopack)
```bash
npm run build
npm start
```

---

## 6. Automated Verification Suite

All **58 unit and integration tests** pass cleanly in ~1.2s:

```
▶ BroccoliDB - Local Storage and CAS Engine
  ✔ initializes BroccoliDB kernel and CAS storage service
  ✔ stores and retrieves binary blobs with SHA-256 CAS verification
  ✔ generates valid, high-resolution SVG fallback card for broken/missing artwork
  ✔ gracefully caches and serves fallback SVG for non-existent card without error
  ✔ persists and retrieves external search results to eliminate API spamming
  ✔ returns diagnostic storage stats from BroccoliDB tables and CAS directory
✔ BroccoliDB - Local Storage and CAS Engine

▶ Image Resolver Utilities - Zero Broken Images & Local Proxy Routing
  ✔ resolves proxied URLs for known card IDs
  ✔ extracts card ID from fallback CDN URL when cardId is missing or zero
  ✔ returns empty string when both cardId and fallbackUrl are missing
  ✔ resolves deck thumbnail to cropped proxied URL
✔ Image Resolver Utilities - Zero Broken Images & Local Proxy Routing

▶ BroccoliQueue - In-Process Durable Job Queue Engine
  ✔ starts queue on isolated BroccoliDB kernel and initializes schema
  ✔ enqueues and processes jobs with worker concurrency
  ✔ guarantees producer idempotency with deduplication
  ✔ reports overview, registered workers, and queue state counts
✔ BroccoliQueue - In-Process Durable Job Queue Engine

▶ BroccoliQueue - Application Integration Helpers
  ✔ enqueues image prefetch and returns job ID
  ✔ enqueues deck preload and returns job ID
  ✔ retrieves live application queue status
✔ BroccoliQueue - Application Integration Helpers

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

▶ Card Inspector & Unified Card Lookup - World-Class Ergonomics
  ✔ indexes over 1,000 official format and tournament cards
  ✔ resolves point-bearing cards with official points and full card text
  ✔ resolves 0-point unlisted tournament cards with complete effect text & stats
  ✔ resolves cards case-insensitively by name
  ✔ resolveCardDetails returns full card object
✔ Card Inspector & Unified Card Lookup - World-Class Ergonomics

▶ Yu-Gi-Oh! Genesys Welcome Landing Page & Format Facts Integrity
  ✔ verifies official Genesys format facts and rules definitions
  ✔ verifies 100-point budget calculation rules for sandbox loadouts
  ✔ verifies inaugural YCS Houston 2026 milestones and champion linkage
  ✔ verifies all 32 qualified tournament decks comply with 100-point limit
✔ Yu-Gi-Oh! Genesys Welcome Landing Page & Format Facts Integrity

ℹ tests 58
ℹ suites 5
ℹ pass 58
ℹ fail 0
```

---

## 7. Official Attribution & Legal Notice

- **Yu-Gi-Oh! Trading Card Game**, official card names, text, and the Genesys format rules are © **Konami Digital Entertainment**.
- High-resolution card artwork and metadata are indexed via the [YGOPRODeck API](https://ygoprodeck.com/api-guide/).
- This project is an open-source, non-commercial community companion and tournament research platform created for Yu-Gi-Oh! players and tournament organizers.
