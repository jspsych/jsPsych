# Group Quiz Multiplayer Demo — Build Plan

A live quiz game built on the jsPsych multiplayer feature. Audience opens a URL (QR
code), answers questions on their phones, and results appear live on a shared
presenter screen. Built by 3 people working in parallel.

> Background reading before you start: skim `examples/multiplayer-ultimatum-game-sync.html`
> (the canonical player-client pattern), `packages/plugin-multiplayer-sync/README.md`,
> and `packages/jspsych/src/modules/plugin-api/MultiplayerAPI.ts`. The game is built from
> 4 primitives — `push`, `wait`, `subscribe`, `getAll` — plus the **`multiplayer-sync`
> plugin**, which packages the `push` → `wait` barrier into one declarative trial. Use the
> plugin for every "wait until the host advances the phase" step; drop to the raw
> primitives only for the presenter screen (Track B) and mid-trial logic.

---

## The core idea (read this first)

Everything lives on one shared object — the **group session**, a "whiteboard" keyed
by participant ID. **Each participant writes ONLY their own key.** There are two kinds
of participant:

- **The host** (the presenter screen). Writes ONE key: `gameState` — the source of
  truth for what phase the game is in and which question is live.
- **The players** (phones). Each writes their own key: their name and their answers.

Players **read** the host's `gameState` to know what to show. The host **reads** all
players' keys to render the lobby, live answer counts, and the leaderboard. Nobody
overwrites anyone else.

```
HOST key:    { role:"host", phase:"question", questionIndex:2, questionStartTime: 1718... }
PLAYER keys: { role:"player", name:"Alice", answers:{ 0:{choice:1,timeMs:1200}, ... } }
             { role:"player", name:"Bob",   answers:{ 0:{choice:3,timeMs:800},  ... } }
```

---

## The shared contract (FREEZE THIS BEFORE PARALLEL WORK)

This is the interface all three tracks build against. Lives in a shared module
(`protocol.js`). Track C owns it; A and B import it.

### Game phases (the host's `phase` field)
`lobby` → `question` → `reveal` → `leaderboard` → (next question…) → `ended`

| phase | host shows | player shows |
|---|---|---|
| `lobby` | joined player names, "Start" button | name entry, then "waiting…" |
| `question` | the question + live answer count + timer | question + answer buttons |
| `reveal` | correct answer + answer distribution | "you were right/wrong" |
| `leaderboard` | top scores | their rank/score |
| `ended` | final podium | final score |

### Host's `gameState` object
```js
{
  role: "host",
  phase: "question",
  questionIndex: 2,            // which question is live
  questionStartTime: 1718000, // Date.now() when question began (for speed scoring)
  questionDurationMs: 20000,  // how long players have
}
```

### Player's object
```js
{
  role: "player",
  name: "Alice",
  answers: {                  // keyed by questionIndex
    0: { choice: 1, timeMs: 1200 },   // choice = button index, timeMs = ms to answer
    1: { choice: 3, timeMs: 800 },
  }
}
```

### Questions data (host-only — see security note)
```js
[
  { prompt: "Capital of France?", choices: ["Berlin","Paris","Rome","Madrid"], correct: 1 },
  ...
]
```

> **Security note:** keep `correct` answers ONLY on the host/in the questions file
> players never load. If players receive the correct answer before `reveal`, anyone
> can read it in browser devtools and "win." Players send their `choice`; the host
> decides correctness at `reveal`.

### Scoring (pure function, Track C owns)
`points = correct ? (base + speedBonus) : 0`, e.g. `base = 1000`,
`speedBonus = round(1000 * (1 - timeMs / questionDurationMs))`. Host computes from
player answers + the questions key at `reveal`.

---

## How a single question flows (the protocol in motion)

1. **Host** sets `phase:"question"`, `questionIndex:k`, `questionStartTime:Date.now()`.
2. **Players** are `wait`ing for `phase==="question"`; they render question `k`,
   start a local timer, show answer buttons.
3. **Player** clicks → `push` `answers[k] = { choice, timeMs }`.
4. **Host** `subscribe`s; live-updates the "12 / 20 answered" counter as keys arrive.
5. **Host** moves on when all answered OR timer expires → sets `phase:"reveal"`,
   computes scores.
6. **Players** `wait` for `phase==="reveal"`; show personal right/wrong.
7. **Host** → `phase:"leaderboard"` → (advance) → back to step 1 with `k+1`.
8. After the last question → `phase:"ended"`, final podium.

---

## Phase 0 — De-risk spike (WHOLE TEAM, ~half a day) ⚠️ do this first

Two unknowns can sink the live demo. Prove them before committing to the full build.

- [ ] **Group size load test. ⬅ THE #1 RISK — the `multiplayer-sync` plugin does NOTHING
      to mitigate this.** JATOS group studies were designed for small groups. Open ~20
      browser tabs (or a script) all joining one group and pushing. Does the group session
      stay responsive? Is there a member cap? **If this fails, the whole "room full of
      phones" premise needs rethinking — find out now, before any track-building.**
- [ ] **Host-drives-state proof.** One host page that `push`es a hardcoded
      `gameState`, two player pages that `wait` on it and react. Proves the
      asymmetric host/player pattern works end to end.
- [ ] **Decide:** confirm host = a standalone presenter page (recommended), not a
      jsPsych timeline. Confirm host election = the presenter screen is the host (the
      person running the demo opens it first). Write the decision here.

## Phase 1 — Freeze the contract (WHOLE TEAM, ~1–2 hrs)

- [ ] Agree on the `protocol.js` shapes above; adjust as needed.
- [ ] Track C writes `protocol.js` as a stub (constants + scoring function + empty
      questions array) and commits it so A and B can import immediately.
- [ ] **Build an in-memory mock adapter** (implements `MultiplayerAdapter`: see
      `MultiplayerAPI.ts:14`). This lets everyone develop locally in multiple browser
      tabs WITHOUT JATOS/Docker. Huge speedup. (Cross-tab sync via `localStorage`
      events or `BroadcastChannel`.) This is the single best investment for parallel work.
      **Head start:** `packages/plugin-multiplayer-sync/src/index.spec.ts` already has a
      working `MockAdapter` implementing the full contract over a shared in-memory channel
      with per-key write semantics. It's same-process (for tests) — swap its shared static
      array for a `BroadcastChannel` to get cross-tab sync. Don't start from zero.

## Phase 2 — Parallel build (THREE TRACKS)

### Track A — Player client  (jsPsych timeline)
What the player sees on their phone. A jsPsych experiment, like the ultimatum game.
Almost every step here is "do something, then wait for the host to advance the phase" —
so it is built mostly from `multiplayer-sync` barrier trials. Model on
`examples/multiplayer-ultimatum-game-sync.html`.
- [ ] Name entry: an `html-keyboard-response`/survey trial to capture the name.
- [ ] Lobby barrier: `multiplayer-sync` with `push_data: { role:"player", name, answers:{} }`
      and `wait_for: g => g[hostId]?.phase === "question"`.
- [ ] Question trial: a normal interactive `html-button-response` with
      `trial_duration: questionDurationMs`. Read the live question from
      `gameState.questionIndex`; in `on_finish`, `push` `answers[k] = { choice, timeMs }`.
      (This one is NOT a barrier — it is a real interactive trial.)
- [ ] Reveal barrier: `multiplayer-sync` with `wait_for: g => g[hostId]?.phase === "reveal"`;
      read the personal right/wrong result from `data.group` in `on_finish`. Set a `timeout`
      as a safety net so a vanished host can't hang the player forever.
- [ ] Leaderboard / next-question barriers: more `multiplayer-sync` trials keyed on the
      next phase; loop with `conditional_function` until `phase === "ended"`.
- [ ] Mobile-friendly CSS (big tap targets).
- *Learns:* jsPsych trials, `conditional_function`, the `multiplayer-sync` plugin, `push`,
      reading group state in `on_finish`, lifecycle hooks.
- *Note:* the player needs `hostId` (the host's participant key). Decide in Phase 0 how
      players learn it — e.g. the host writes `role:"host"` and players find the key whose
      value has `role === "host"`.

### Track B — Host / presenter screen  (standalone HTML page)
The big screen everyone watches. A plain page using the adapter directly (no jsPsych, and
NOT the `multiplayer-sync` plugin — that's a timeline trial; the host reacts continuously
via `subscribe`).
- [ ] `connect` the adapter; `subscribe` to the whole board.
- [ ] Lobby view: show names as players join; "Start" button.
- [ ] Question view: big question text, live "N answered" counter, countdown timer.
- [ ] Reveal view: bar chart of answer distribution + highlight correct answer.
- [ ] Leaderboard view: sorted standings; final podium on `ended`.
- [ ] Host controls: advance question (manual button and/or auto on timer).
- *Learns:* `subscribe`, `getAll`, the adapter directly, DOM rendering / a chart lib.

### Track C — Game engine + content  (shared logic, the "contract owner")
The brain that both A and B depend on. Pure, testable logic + data.
- [ ] `protocol.js`: phase constants, `gameState`/player shapes, scoring function.
- [ ] The state machine the host calls to advance phases and write `gameState`.
- [ ] `questions.js`: the actual quiz content (keep `correct` host-only).
- [ ] Timer logic; "have all players answered?" check.
- [ ] Unit-test the scoring + state transitions (no network needed).
- *Learns:* the protocol, pure functions, testing, owning an interface others consume.

> Dependency: A and B both import C's `protocol.js`. That's why Phase 1 freezes it
> first and C stubs it before anyone builds on top.

## Phase 3 — Integration + live test

- [ ] Wire all three against the mock adapter in multiple tabs end to end.
- [ ] Swap mock adapter → JATOS adapter; run inside JATOS locally.
- [ ] Real-room rehearsal: several phones on the same group, host on a laptop/projector.
- [ ] Handle edge cases: player joins mid-game, player disconnects, nobody answers,
      ties on the leaderboard.

## Phase 4 — Package + demo polish

- [ ] Build the JATOS `.jzip` (model on `scripts/build-jatos-ultimatum.js`). Remember to
      bundle `packages/plugin-multiplayer-sync/dist/index.browser.js` in the player client's
      asset list — that script already does it for the ultimatum game.
- [ ] QR code → join URL; smooth onboarding (this IS the demo).
- [ ] Visual polish on the presenter screen (it's what the audience watches).
- [ ] Dry run the full live demo once more.

---

## Suggested track ownership

| Track | Focus | Good for someone who wants to learn… |
|---|---|---|
| A — Player client | jsPsych timelines, mobile UI | how jsPsych experiments are built |
| B — Presenter screen | live rendering, charts, the adapter | reactive UI + the network layer |
| C — Engine + content | protocol, scoring, tests | clean interfaces + game logic |

Rotate or pair if someone finishes early. The mock adapter (Phase 1) is what makes
all three buildable at the same time without stepping on each other.
