# For The Kids — Learning Without a Paywall

**Live at: https://pipsplayground.com and https://freekidslearning.com**
(also https://for-the-kids.seanknox.workers.dev)

A free, ad-free, interactive learning site for kids ages 3–10. Parents create child
profiles (stored locally in the browser — no accounts, no server, no cost), kids pick
their avatar and play their way through three worlds:

- 🎈 **Letter Land** (ages 3–6) — Letter Pop, Letter Match, Alphabet Parade, Word Builder, Rhyme Time, Pip's Sound Garden
- 🐠 **Number Ocean** (ages 3–7) — Count the Fish, Bubble Math, Number Line Frog, Shape Safari, Pattern Parade
- 🏔️ **Math Mountain** (ages 7–10) — Times Table Garden, Array Builder, Rocket Race, Clockwork Castle, Story Problem Theater, Fraction Pizza Party

Each child's age tunes the experience: their recommended world leads the map,
age-fit games are front and center (others stay open as "warm-ups" or "big kid
challenges"), and first plays start at an age-appropriate difficulty level.

Wrong answers never fail — they trigger escalating, spoken hints (nudge → visual
clue → show-and-explain) and every round ends in success. Correct answers earn stars,
streaks level you up, and level-ups unlock stickers for your sticker book.

Everything important is read aloud (Web Speech API) so pre-readers can play solo,
with cheerful synthesized sound effects. A mute toggle lives in the Grown-Ups area,
which is protected by a multiplication question little fingers can't solve.

## Run it

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (round generators, progression, hints, storage)
npm run build    # production build in dist/
```

The production build in `dist/` is fully static. It deploys to Cloudflare
Workers (free tier) with:

```bash
npm run build && npx wrangler deploy
```

## Roadmap

The design spec — including 25+ future game ideas grouped by age bracket and the
plan for real parent logins with cloud sync — lives in
[docs/superpowers/specs/2026-07-19-kids-learning-site-design.md](docs/superpowers/specs/2026-07-19-kids-learning-site-design.md).
