# Daily Davar | דָּבָר

A daily Jewish knowledge game tied to the Hebrew calendar. Every day brings a new question drawn from the weekly parasha, Jewish law, history, and holidays — at three difficulty levels.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (CSS-variable-based theme, no config file)
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) for AI-generated daily questions
- **React 19**

## Getting Started

```bash
npm install
```

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=your_key_here
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder Structure

```
app/
  api/question/route.ts   # POST handler — generates question via Claude API
  layout.tsx              # Root layout, metadata
  page.tsx                # App controller — all game state lives here
  globals.css             # Design tokens (CSS variables) + Tailwind v4 @theme

components/
  Header.tsx              # Top bar: logo, streak pill, how-to-play, login
  HomeScreen.tsx          # Difficulty picker (Aleph / Bet / Gimel)
  GameScreen.tsx          # Game wrapper — context card, question, input, hints
  ResultScreen.tsx        # Win/loss screen with stats and share
  game/
    ContextCard.tsx       # Navy card showing parasha and context passage
    AttemptDots.tsx       # Row of attempt indicators (checked / x / next)
    MultipleChoice.tsx    # A/B/C/D option buttons
    WordleGrid.tsx        # 5xN letter grid with colour-coded tiles
    WordleKeyboard.tsx    # On-screen QWERTY keyboard with letter statuses
    TextBox.tsx           # Free-text input for hard (Gimel) questions
    HintPanel.tsx         # Reveal-hint button / hint display after 2 wrong attempts
  modals/
    HowToPlayModal.tsx    # Overlay explaining rules and wordle colour coding
    AuthModal.tsx         # Login / register form (UI only)

lib/
  types.ts                # All shared TypeScript types + FALLBACK_QUESTIONS
  evaluateGuess.ts        # Wordle letter-status evaluation (two-pass algorithm)
  share.ts                # generateShareText + shareResult (Web Share API)
  jewishDate.ts           # Date helpers (Gregorian + Hebrew date strings)
```

## TODOs

- **Hebrew calendar**: `getHebrewDateString()` returns a hardcoded placeholder. Integrate [hebcal](https://github.com/hebcal/hebcal-es6) for live Hebrew dates.
- **User auth**: `AuthModal` is UI-only. Wire up a real auth provider (e.g. NextAuth, Supabase) to persist streaks across devices.
- **Daily locking**: Questions currently regenerate on each page load. Add a date-keyed cache (e.g. KV store, cookie) so each user gets the same question all day.
