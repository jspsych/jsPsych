// Shared protocol for the Group Quiz demo.
// Loaded as a plain <script> by index.html.
// questions.js (correct answers) is host-only and never loaded by players.

const PHASES = Object.freeze({
  LOBBY: "lobby",
  QUESTION: "question",
  REVEAL: "reveal",
  LEADERBOARD: "leaderboard",
  ENDED: "ended",
});

const QUESTION_DURATION_MS = 20000;
const BASE_SCORE = 1000;

/** Returns the participant ID of the host, or null if no host has pushed yet. */
function getHostId(group) {
  return Object.keys(group).find((id) => group[id]?.role === "host") ?? null;
}

// ── Monotonic phase clock ──────────────────────────────────────────────────
// The host advances through phases by overwriting a single `phase` field, and
// JATOS does not guarantee a client observes every intermediate snapshot. If a
// lagging player's snapshot jumps past a phase, an exact `phase === X` barrier
// would become permanently unsatisfiable and the player hangs forever. To avoid
// that, every host push also carries a `step`: a number that only ever
// increases. Players wait with `hostStepValue(group) >= phaseStep(...)`, and a
// `>=` test on a monotonic value can never be missed — once true it stays true.

const PHASE_ORDER = Object.freeze({
  [PHASES.LOBBY]: 0,
  [PHASES.QUESTION]: 1,
  [PHASES.REVEAL]: 2,
  [PHASES.LEADERBOARD]: 3,
});
const PHASES_PER_QUESTION = 4;

/** Monotonically increasing step for a given question index + phase. */
function phaseStep(questionIndex, phase) {
  // ENDED is terminal: a step above any question's step so it satisfies every
  // barrier's `>=` check, letting players fall through to the end screen.
  if (phase === PHASES.ENDED) return Number.MAX_SAFE_INTEGER;
  return (questionIndex ?? 0) * PHASES_PER_QUESTION + PHASE_ORDER[phase];
}

/** The host's current step, or -1 if no host has pushed a step yet. */
function hostStepValue(group) {
  const hostId = getHostId(group);
  const step = hostId !== null ? group[hostId]?.step : undefined;
  return typeof step === "number" ? step : -1;
}

/** Points for a single correct answer. Returns 0 for wrong answers. */
function scoreAnswer(correct, timeMs, durationMs) {
  if (!correct) return 0;
  const speedBonus = Math.round(BASE_SCORE * (1 - timeMs / durationMs));
  return BASE_SCORE + Math.max(0, speedBonus);
}

/**
 * Returns [{ participantId, name, totalScore }] sorted by score descending.
 * Includes participantId so callers can look up their own rank by ID rather than
 * by name (names aren't guaranteed unique).
 */
function computeLeaderboard(group) {
  return Object.entries(group)
    .filter(([, entry]) => entry?.role === "player")
    .map(([participantId, entry]) => ({
      participantId,
      name: entry.name ?? "?",
      totalScore: entry.totalScore ?? 0,
    }))
    .sort((first, second) => second.totalScore - first.totalScore);
}
