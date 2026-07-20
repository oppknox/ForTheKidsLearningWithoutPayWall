# Kids Learning Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v1 free kids learning SPA (ages 3–10): parent-managed local profiles, three themed worlds, seven games, escalating hints, stars/stickers, speech + sound effects.

**Architecture:** React 19 + Vite + TypeScript client-only SPA. All persistence through one storage module over localStorage. Games are declarative plug-ins (round generator + display component) run by a shared `GameShell` that owns the answer/hint/reward loop. Pure logic (round generation, mastery, hints, storage) is unit-tested with Vitest; screens are verified by browser play-check.

**Tech Stack:** react, react-dom, react-router-dom, vite, typescript, vitest, @testing-library/react (logic-first testing; most tests are pure functions).

## Global Constraints

- All art is inline SVG/CSS/emoji — no image files, no external assets, no CDN fonts.
- No backend calls of any kind. localStorage key: `ftk-state-v1`.
- Kid copy tone: never "wrong", "no", or red X. Hints escalate nudge → visual → show-and-win; every round ends in success and awards ≥1 star.
- Touch targets ≥ 64px. Everything important is also spoken via Web Speech API; app must remain fully playable when speech is unavailable.
- TypeScript strict. Frequent commits, message style `feat:/test:/chore:`.

---

### Task 1: Scaffold Vite + React + TS app with Vitest

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.gitignore`

**Interfaces:**
- Produces: running dev server, `npm test` (vitest run), `npm run build` green.

- [ ] Scaffold with `npm create vite@latest . -- --template react-ts`, then `npm i react-router-dom` and `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`.
- [ ] Add to package.json scripts: `"test": "vitest run", "test:watch": "vitest"`. Configure vitest in `vite.config.ts` (`environment: 'jsdom'`).
- [ ] Replace boilerplate: `App.tsx` renders `<h1>For The Kids</h1>` placeholder; `styles.css` gets base reset + `--font` stack (system rounded fonts: `'Comic Sans MS', 'Segoe UI', system-ui`).
- [ ] Verify: `npm run build` passes, `npm test` passes (no tests → configure `passWithNoTests: true`).
- [ ] Commit `chore: scaffold vite react-ts app with vitest`.

### Task 2: Core types + storage module (TDD)

**Files:**
- Create: `src/types.ts`, `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

**Interfaces (Produces — used everywhere):**

```ts
// src/types.ts
export type WorldId = 'letters' | 'numbers' | 'multiplication';
export interface AvatarConfig { creature: 'fox'|'frog'|'robot'|'cat'|'panda'|'dino'; color: string; accessory: 'none'|'bow'|'cap'|'glasses'|'crown'; }
export interface SkillProgress { level: number; streak: number; totalCorrect: number; }
export interface Profile {
  id: string; name: string; age: number; avatar: AvatarConfig;
  stars: number; stickers: string[];            // sticker ids
  progress: Record<string, SkillProgress>;      // keyed by gameId
}
export interface AppState { profiles: Profile[]; activeProfileId: string | null; muted: boolean; }
export const DEFAULT_STATE: AppState = { profiles: [], activeProfileId: null, muted: false };
```

```ts
// src/lib/storage.ts
export function loadState(): AppState        // parse localStorage['ftk-state-v1']; on ANY error return structuredClone(DEFAULT_STATE)
export function saveState(s: AppState): void // JSON.stringify; swallow quota errors
```

- [ ] Write failing tests: round-trips state; returns defaults on missing key, corrupt JSON, and non-object JSON; saveState never throws when localStorage.setItem throws.
- [ ] Run `npm test` → FAIL (module missing). Implement. Run → PASS.
- [ ] Commit `feat: core types and resilient storage module`.

### Task 3: Shared utils — rng + progress rules (TDD)

**Files:**
- Create: `src/lib/rng.ts`, `src/lib/progress.ts`
- Test: `src/lib/rng.test.ts`, `src/lib/progress.test.ts`

**Interfaces (Produces):**

```ts
// rng.ts
export function randInt(min: number, max: number): number   // inclusive
export function shuffle<T>(arr: T[]): T[]                    // non-mutating
export function sample<T>(arr: T[], n: number): T[]          // distinct
// progress.ts
export const STREAK_TO_LEVEL_UP = 3;
export const MAX_LEVEL = 5;
export interface AnswerResult { progress: SkillProgress; leveledUp: boolean; starsEarned: number; }
export function applyCorrect(p: SkillProgress, hintsUsed: number): AnswerResult
// starsEarned: 3 if hintsUsed===0, 2 if 1, 1 otherwise. streak+1; on streak===3 → level+1 (cap MAX_LEVEL), streak resets, leveledUp true.
export function applyHint(p: SkillProgress): SkillProgress   // resets streak to 0, nothing else
export function newProgress(): SkillProgress                  // {level:1, streak:0, totalCorrect:0}
```

- [ ] Failing tests: randInt bounds over 200 iterations; shuffle preserves members & doesn't mutate; sample distinctness. applyCorrect: star tiers per hintsUsed; streak increments; level-up at 3 with streak reset; cap at MAX_LEVEL (no leveledUp at cap); totalCorrect increments. applyHint resets streak only.
- [ ] Run → FAIL. Implement. Run → PASS. Commit `feat: rng utils and mastery progression rules`.

### Task 4: Audio — speech + sfx modules

**Files:**
- Create: `src/lib/speech.ts`, `src/lib/sfx.ts`

**Interfaces (Produces):**

```ts
// speech.ts — all no-ops when APIs unavailable or muted
export function setMuted(m: boolean): void
export function speak(text: string, opts?: { rate?: number; pitch?: number }): void  // cancels queue first; rate default 0.95, pitch 1.15
// sfx.ts — WebAudio oscillator blips, all guarded + muted-aware
export function playPop(): void        // short sine blip 600→900Hz
export function playDing(): void       // two-note happy chime
export function playFanfare(): void    // 4-note rising arpeggio
export function playWhoosh(): void     // noise sweep for hints
```

- [ ] Implement with lazy `AudioContext` (created on first user-gesture call, try/catch everything). No unit tests (browser API shims add no value) — verified in play-check.
- [ ] Commit `feat: speech synthesis and webaudio sfx`.

### Task 5: ProfilesContext — app state provider (TDD via reducer)

**Files:**
- Create: `src/state/reducer.ts`, `src/state/ProfilesContext.tsx`
- Test: `src/state/reducer.test.ts`

**Interfaces (Produces):**

```ts
// reducer.ts — pure
export type Action =
  | { type:'addProfile'; name:string; age:number; avatar:AvatarConfig }
  | { type:'updateProfile'; id:string; patch:Partial<Pick<Profile,'name'|'age'|'avatar'>> }
  | { type:'deleteProfile'; id:string }
  | { type:'selectProfile'; id:string|null }
  | { type:'recordCorrect'; gameId:string; hintsUsed:number; stickerPool:string[] }  // applies applyCorrect to active profile; on leveledUp grants first stickerPool sticker not owned
  | { type:'recordHint'; gameId:string }
  | { type:'setMuted'; muted:boolean }
export function reducer(s: AppState, a: Action): AppState
// ProfilesContext.tsx
export function AppStateProvider({children}): JSX.Element   // useReducer(loadState()), saveState on every change, setMuted sync to speech/sfx
export function useAppState(): { state:AppState; dispatch:(a:Action)=>void; activeProfile:Profile|null }
```

- [ ] Failing reducer tests: add/update/delete/select; recordCorrect creates progress on first play, awards stars to profile, grants sticker on level-up (skips owned), recordHint resets streak; actions are no-ops with no active profile.
- [ ] Run → FAIL. Implement. Run → PASS. Commit `feat: app state reducer and provider`.

### Task 6: Visual kit — Mascot, Confetti, BigButton, AvatarSVG, app chrome

**Files:**
- Create: `src/components/Mascot.tsx`, `src/components/Confetti.tsx`, `src/components/BigButton.tsx`, `src/components/AvatarSVG.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces (Produces):**

```ts
export function Mascot({ mood, size }: { mood:'idle'|'happy'|'thinking'|'celebrate'; size?:number }): JSX.Element  // Pip the fox: SVG circles/ellipses, CSS keyframe bounce/wiggle per mood
export function Confetti({ burst }: { burst:number }): JSX.Element  // re-fires 40 CSS-animated pieces whenever `burst` increments
export function BigButton(props: ButtonHTMLAttributes & { color?:string }): JSX.Element // ≥64px, squash-and-stretch :active
export function AvatarSVG({ config, size }: { config:AvatarConfig; size?:number }): JSX.Element
```

- [ ] Build components; App gets router shell + gradient sky background + floating cloud/balloon ambient layer.
- [ ] Verify in browser (component smoke via dev server). Commit `feat: mascot, confetti, buttons, avatars, app chrome`.

### Task 7: Screens — onboarding, parent gate, who's playing

**Files:**
- Create: `src/screens/WhoIsPlaying.tsx`, `src/screens/ProfileEditor.tsx`, `src/screens/ParentGate.tsx`
- Modify: `src/App.tsx` (routes `/`, `/grown-ups`, `/grown-ups/edit/:id?`)

**Interfaces:**
- Consumes: `useAppState`, `AvatarSVG`, `BigButton`, `speak`.
- Produces: route flow — `/` shows avatar cards + "Grown-Ups" corner button; ParentGate asks a typed 2-digit×1-digit product before revealing profile management; ProfileEditor = name input, age picker 3–10, avatar builder (creature/color/accessory swatches).

- [ ] Build screens; no profiles → `/` redirects into onboarding; selecting an avatar dispatches selectProfile and navigates to `/play`.
- [ ] Browser-verify create/select/edit/delete flow. Commit `feat: profiles, parent gate, who-is-playing`.

### Task 8: World map, world screens, sticker book

**Files:**
- Create: `src/screens/WorldMap.tsx`, `src/screens/WorldScreen.tsx`, `src/screens/StickerBook.tsx`, `src/games/registry.ts`, `src/games/types.ts`
- Modify: `src/App.tsx` (routes `/play`, `/world/:worldId`, `/stickers`)

**Interfaces (Produces — the game contract):**

```ts
// games/types.ts
export interface Hints { nudge: string; explain: string }   // spoken+shown at tiers 1 and 3; tier 2 is visual (shrink wrong choices + sparkle correct), handled by GameShell
export interface Choice { id: string; label: string }
export interface Round {
  promptText: string; promptSpeech: string;
  choices: Choice[]; answerId: string; hints: Hints;
  payload?: unknown;                                    // display data (fish count, factors, etc.)
}
export interface GameDef {
  id: string; world: WorldId; title: string; emoji: string; ages: string;
  roundsPerSession: number;                             // 5 for all v1 games
  generateRound(level: number): Round;
  Display?: (p: { round: Round; hintTier: number }) => JSX.Element;  // scene above the choices
  freePlay?: () => JSX.Element;                          // non-quiz games (Alphabet Parade) render this instead
}
// games/registry.ts
export const WORLDS: Record<WorldId,{ title:string; emoji:string; tagline:string; theme:string }>
export const GAMES: GameDef[]                            // populated by tasks 9–12
export function gamesForWorld(w: WorldId): GameDef[]
export const STICKER_POOL: string[]                      // ~24 emoji sticker ids like '🦄','🚀','🌈'
```

- [ ] WorldMap: three big world cards (theme colors: letters=warm sunset, numbers=ocean blues, multiplication=purple mountains), active kid's avatar + star count in header, sticker book button. WorldScreen lists games with level badges from profile progress. StickerBook shows owned stickers big, unowned as faded '?'.
- [ ] Browser-verify navigation. Commit `feat: world map, world screens, sticker book`.

### Task 9: GameShell — the answer/hint/reward loop (TDD on hint machine)

**Files:**
- Create: `src/games/hintMachine.ts`, `src/games/GameShell.tsx`
- Modify: `src/App.tsx` (route `/game/:gameId`)
- Test: `src/games/hintMachine.test.ts`

**Interfaces (Produces):**

```ts
// hintMachine.ts — pure state for one round
export interface RoundState { hintTier: 0|1|2|3; wrongIds: string[]; solved: boolean }
export function initialRound(): RoundState
export function pick(rs: RoundState, choiceId: string, answerId: string): RoundState
// wrong pick: tier+1 (max 3), choiceId appended to wrongIds; right pick: solved=true. At tier 3 the answer is revealed; ONLY the answer is pickable.
```

- [ ] Failing tests: escalation 0→1→2→3 on wrong picks, tier caps at 3, correct pick solves at any tier, wrongIds accumulate & dedupe.
- [ ] Implement → PASS.
- [ ] Build GameShell: runs `roundsPerSession` rounds; prompt spoken on round start; wrong pick → playWhoosh, mascot 'thinking', speak nudge (tier1) / visual treatment (tier2: wrongIds shrink, answer sparkles) / reveal+explain (tier3); correct → playDing/playPop, dispatch recordCorrect (hintsUsed = tier), star fly-up, next round; session end → playFanfare, Confetti, mascot 'celebrate', stars summary, "Play again / Back to world" buttons; level-up banner + sticker reveal when reducer grants one.
- [ ] Commit `feat: game shell with escalating hint loop`.

### Task 10: Letter Land — Letter Pop, Letter Match, Alphabet Parade (TDD generators)

**Files:**
- Create: `src/games/letters/letterPop.tsx`, `src/games/letters/letterMatch.tsx`, `src/games/letters/alphabetParade.tsx`, `src/games/letters/letterData.ts`
- Modify: `src/games/registry.ts` (register 3 games)
- Test: `src/games/letters/letters.test.ts`

**Interfaces:**
- Consumes: `GameDef`, `Round`, rng utils.
- Produces: `letterData.ts` exports `ALPHABET: {letter:string; word:string; emoji:string}[]` (A→Z, e.g. `{letter:'B', word:'Banana', emoji:'🍌'}`); each game file default-exports a `GameDef`.

Generator rules (tested):
- **letterPop** (`id:'letterPop'`): target letter; choices = target + distractors, count = 2+level (max 5); level≥3 mixes lookalikes (b/d/p/q, M/W/N, O/Q/C, E/F) when available; level≥4 choices render lowercase. Display: choices ARE balloons (custom choice renderer flag `payload.balloons=true`). Hint nudge: "Listen! ‘B’ says buh — like Banana 🍌!".
- **letterMatch** (`id:'letterMatch'`): shows big uppercase in Display; choices are lowercase letters (3+min(level,3)); answer is the matching lowercase.
- **alphabetParade** (`id:'alphabetParade'`): `freePlay` component — giant letter, word + emoji, speaks "B! Banana!", next/back arrows, progress dots; completing Z dispatches recordCorrect once with hintsUsed 0.
- [ ] Failing generator tests: answer always among choices; choice counts per level; letterMatch answer is lowercase of shown letter; no duplicate choices; parade data covers 26 letters with unique letters.
- [ ] Implement + register → tests PASS. Browser-verify all three. Commit `feat: letter land games`.

### Task 11: Number Ocean — Count the Fish, Bubble Addition (TDD generators)

**Files:**
- Create: `src/games/numbers/countTheFish.tsx`, `src/games/numbers/bubbleAddition.tsx`
- Modify: `src/games/registry.ts`
- Test: `src/games/numbers/numbers.test.ts`

Generator rules (tested):
- **countTheFish** (`id:'countFish'`): level ranges 1: 1–5, 2: 1–8, 3: 1–10, 4: 4–15, 5: 6–20. `payload.count` fish rendered swimming (emoji 🐠 row-wrapped, CSS sway). 3 numeric choices; distractors within ±3, ≥1, distinct. Tier-2 visual: fish get numbered one-by-one.
- **bubbleAddition** (`id:'bubbleAdd'`): levels 1–2 sums ≤5/≤10 addition; level 3 sums ≤20; levels 4–5 subtraction within 10/20 (`payload.op:'+'|'-'`). Display: two bubble clusters of poppable 🫧 (a−b shown as b bubbles popping away at tier 2). Choices: correct ±1..3 distinct, ≥0.
- [ ] Failing tests: ranges per level; distractor constraints (distinct, non-negative, includes answer); subtraction never negative. Implement + register → PASS. Browser-verify. Commit `feat: number ocean games`.

### Task 12: Multiplication Mountain — Array Builder, Rocket Race (TDD generators)

**Files:**
- Create: `src/games/multiplication/arrayBuilder.tsx`, `src/games/multiplication/rocketRace.tsx`
- Modify: `src/games/registry.ts`
- Test: `src/games/multiplication/mult.test.ts`

Generator rules (tested):
- **arrayBuilder** (`id:'arrayBuilder'`): factor pools per level 1: 1–3×1–5, 2: 2–5×2–5, 3: 2–9×2–6, 4: 6–9×6–9, 5: 2–12×2–12. Display renders `a` rows × `b` cols of 💎 appearing staggered; tier-2 hint animates row-by-row count with running total. Choices: product + distractors {product±a, product±b, a·(b±1)} filtered distinct/positive, pick 3 total.
- **rocketRace** (`id:'rocketRace'`): same pools; Display = rocket altitude bar that rises per correct round (`payload.roundIndex`); nudge gives skip-counting clue ("Count by 4s: 4, 8, 12…").
- [ ] Failing tests: factor pools per level; distractors distinct/positive/include product; skip-count hint text matches factor. Implement + register → PASS. Browser-verify. Commit `feat: multiplication mountain games`.

### Task 13: Polish + full verification

**Files:**
- Modify: `src/styles.css`, any screens needing juice; Create: `README.md`

- [ ] Polish pass: per-world background themes, star fly-up animation, mute button placement, responsive check at 375px/768px/1280px.
- [ ] `npm test` all green; `npm run build` green.
- [ ] Full browser play-through: onboarding → pick kid → each of 7 games → wrong answers exercise all 3 hint tiers → level-up grants sticker → sticker book shows it → parent gate blocks profile edit.
- [ ] README: what it is, run instructions, roadmap pointer to spec.
- [ ] Commit `feat: polish, readme, v1 complete`.

## Self-Review Notes

- Spec coverage: profiles/gate (T7), worlds/progression (T3,T8), 7 games (T10–12), hints (T9), rewards/stickers (T5,T8,T9), audio (T4), storage seam (T2), error handling (T2 defaults, T4 guards, unknown-route redirect in T7). Roadmap list lives in spec — no build task needed.
- Types cross-checked: `recordCorrect(hintsUsed)` ↔ GameShell tier; `stickerPool` from registry; `GameDef.freePlay` used only by alphabetParade.
