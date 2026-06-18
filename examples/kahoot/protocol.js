// Shared protocol for the Kahoot demo.
// Loaded as a plain <script> by both host.html and player.html.
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
