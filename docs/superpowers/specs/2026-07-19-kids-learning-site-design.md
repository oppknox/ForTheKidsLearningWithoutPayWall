# Kids Learning Site — Design Spec

**Date:** 2026-07-19
**Status:** Approved
**Project:** ForTheKidsLearningWithoutPayWall — a free, interactive learning website for kids ages 3–10.

## Goals

- Parents can sit a child (age 3–10) in front of the site and it teaches them: the alphabet, then numbers, then multiplication.
- Maximally fun and visually entertaining: animations, mascot, sound, rewards.
- Wrong answers produce helpful, escalating hints — never a fail state.
- Parent-managed child profiles; child picks "who's playing." Local storage only in v1; social login later.
- Zero cost to run and use. No paywall, ever.

## Non-Goals (v1)

- Real authentication / social login (design leaves a clean seam for it).
- Backend, database, or cross-device sync.
- Reading/spelling curriculum beyond letter recognition; division/fractions.
- AI-generated images (all art is hand-built SVG/CSS/emoji).

## Architecture

- **Stack:** React 19 + Vite + TypeScript. Client-side SPA. React Router for navigation.
- **State:** React context (`ProfilesProvider`, `SettingsProvider`) backed by a single isolated storage module (`src/lib/storage.ts`) that reads/writes `localStorage`. Swapping to real auth + cloud sync later = replacing this module only.
- **Games are plug-in modules.** Every game implements a shared contract:
  - Game metadata: id, title, world, age range, skill, icon.
  - A round generator: produces a question, choices, correct answer, and per-tier hint content, parameterized by difficulty level.
  - The shared `GameShell` component owns: presenting rounds, right/wrong handling, hint escalation, stars, celebration, progress reporting. Games stay small and declarative.
- **Audio:** `src/lib/speech.ts` (Web Speech API — reads letters, numbers, questions, hints aloud) and `src/lib/sfx.ts` (WebAudio-synthesized pops, dings, fanfares). Global mute toggle persisted in settings.
- **Testing:** Vitest for round generation, answer checking, hint escalation, mastery/leveling, and storage round-trips. Manual browser play-check per game.

## Profiles & Parent Gate

- First visit → parent onboarding: create 1+ child profiles (name, age 3–10, avatar).
- **Avatar builder:** choose creature (fox, frog, robot, cat…), color, and accessory — composed SVG.
- **"Who's playing?" screen:** big tappable avatar cards. Selection stored as active profile.
- **Parent gate** protecting profile management and settings: a written multiplication question (e.g., "type 7 × 6") that a preschooler can't pass.
- Each profile stores: name, age, avatar config, per-skill progress (level + mastery streak), stars, unlocked stickers.

## The Three Worlds

| World | Ages | Skills | v1 Games |
|---|---|---|---|
| 🎈 Letter Land | 3–6 | Letter recognition, letter sounds, upper/lowercase | Letter Pop, Letter Match, Alphabet Parade |
| 🐠 Number Ocean | 3–7 | Counting, number recognition, addition/subtraction | Count the Fish, Bubble Addition |
| 🏔️ Multiplication Mountain | 7–10 | Times tables 1–12, arrays, fluency | Array Builder, Rocket Race |

### v1 Game Details

1. **Letter Pop** (3–6) — Balloons float up carrying letters. Pip says "Pop the letter B!" (spoken + shown). Levels: 3 balloons/similar-looking distractors added/lowercase mixed in.
2. **Letter Match** (4–6) — Pairs of cards: match uppercase to lowercase. Levels increase pair count.
3. **Alphabet Parade** (3–5) — Non-quiz mode: tap through A–Z; each letter animates in with a word + emoji picture ("B — 🍌 Banana!") and is spoken. Pure exploration, stars for completing the parade.
4. **Count the Fish** (3–6) — Fish swim across; child counts and taps the right number from 3 choices. Levels: 1–5 → 1–10 → 1–20, distractors get closer.
5. **Bubble Addition** (5–7) — "3 + 2" shown with poppable bubble groups; pop to count, then pick the sum. Levels: sums ≤5, ≤10, ≤20, then subtraction.
6. **Array Builder** (7–10) — "3 × 4" builds as 3 rows of 4 gems appearing one-by-one; child answers the total. Teaches multiplication as repeated addition/arrays. Levels walk the times tables.
7. **Rocket Race** (7–10) — Multiplication facts fuel a rocket; each right answer boosts altitude. Optional gentle timer at higher levels for fluency.

## Progression & Difficulty

- Profile age selects default world ordering and starting levels; nothing is hard-locked — kids can try anything.
- Per-skill **mastery streak**: 3 consecutive correct → level up (celebration). Wrong answers never level down.
- Progress is per-profile and visible as a simple map/path in each world.

## Wrong Answers → Escalating Hints (never fail)

Tier 1 — **Nudge:** encouragement + restated clue, spoken ("Ooh, so close! Listen again… B says buh!"). Wrong pick wobbles away.
Tier 2 — **Visual hint:** wrong choices shrink/fade, correct one sparkles; concept visualizations animate (array draws itself, fish get counted one-by-one with numbers appearing).
Tier 3 — **Show & win:** correct answer glows with a spoken explanation; tapping it still completes the round and earns a star.

Tone rules: no buzzer, no red X, no "wrong." Mascot reacts with playful surprise and warmth. Hints reset per round; a round always ends in success.

## Fun Layer

- **Mascot "Pip":** round bouncy SVG fox. Idle bounce, cheer, hint-whisper, confetti-backflip on level-up. Present on every screen.
- **Rewards:** star per correct answer (fewer hints = more sparkle, but always ≥1); stickers unlocked at level-ups fill a per-child **sticker book**; trophies per world tier completed.
- **Juice:** confetti bursts, squash-and-stretch on every tap, floating balloons/bubbles/clouds as ambient background per world, gradient skies. All CSS/SVG animation.
- **Audio:** everything important is spoken (pre-readers play solo). Cheerful synth sfx. Mute persists.
- **Kid-scale UI:** huge touch targets, minimal text, icons + voice over words, no external links, no ads, nothing to buy.

## Future Roadmap — Game Ideas by Age Bracket

### Ages 3–4 (pre-readers — recognition, counting, motor skills)
- **Alphabet Petting Zoo** — tap an animal, hear its letter and name ("E! Elephant! 🐘").
- **Shape Sorter** — drag shapes into matching holes; shapes giggle when placed.
- **Color Splash** — "Tap everything RED!" in a busy silly scene.
- **Counting Picnic** — feed a hungry bear the right number of sandwiches.
- **Big & Small** — pick the biggest/smallest of a group of dancing animals.
- **Sound Safari** — hear an animal sound, tap the animal that makes it.

### Ages 5–6 (letters→words, numbers→arithmetic)
- **Word Builder** — drag letters to spell CVC words (C-A-T) with picture + voice help.
- **Rhyme Time** — pick the picture that rhymes with "cat" (hat! bat!).
- **Number Line Frog** — hop a frog along a number line to solve 4+3.
- **Ten Frame Fireflies** — light up fireflies in a ten-frame to see number bonds.
- **Missing Letter Train** — the alphabet train is missing a car; which letter goes there?
- **Pattern Parade** — continue the pattern (🔵🔴🔵🔴…?) with marching toys.
- **Coin Counter Store** — buy toys with pennies/nickels (early money math).

### Ages 7–8 (fluency, multiplication foundations)
- **Times Table Garden** — plant seed rows (3 rows × 4 seeds) and watch answers bloom.
- **Skip-Count Stepping Stones** — cross the river landing only on multiples of 5.
- **Math Monster Feeding** — monster only eats numbers that solve the equation.
- **Clock Shop** — set clock hands to match the time ("quarter past 3").
- **Fact Family Houses** — 3, 4, 12 live together: build 3×4, 4×3, 12÷4, 12÷3.
- **Word Problem Theater** — tiny animated stories that act out the problem as you solve.

### Ages 9–10 (mastery, speed, multi-step)
- **Multiplication Grand Prix** — race opponents by answering facts fast (car speed = accuracy).
- **Division Dungeon** — unlock doors by sharing treasure equally among knights.
- **Fraction Pizza Parlor** — fill pizza orders: "3/8 pepperoni, 1/2 cheese."
- **Estimation Station** — guess the jellybean count, closest guess wins the jar.
- **Order of Operations Robot** — program a robot; it executes your math steps literally (and hilariously wrong if mis-ordered).
- **Times Table Boss Battles** — defeat the "Sevens Dragon" by mastering the 7s table.

## Auth Seam (later)

When social login arrives: an auth provider (e.g., Firebase) authenticates the **parent**; child profiles hang off the parent account; `storage.ts` gains a synced backend implementation behind the same interface. Cookie/local data migrates on first login.

## Error Handling

- Storage read failures → fall back to fresh defaults, never crash.
- Speech synthesis unavailable (some browsers) → games remain fully playable; text prompts always shown.
- Unknown route / missing profile → redirect to "Who's playing?".
