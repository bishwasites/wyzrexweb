import "server-only";

// In-memory, per-process rate limiter. Good enough for a contact form on a
// single-instance deploy — it resets on redeploy and doesn't coordinate
// across serverless instances, which is an explicit, accepted tradeoff for
// "simple" per the brief rather than pulling in Redis for a form nobody's
// hammering. If this ever needs to hold up under multi-instance traffic,
// swap the Map for Upstash's Redis-backed limiter.
const hits = new Map<string, number[]>();

const WINDOW_MS = 10 * 60 * 1000;

/** Returns true if `key` is still within its allowance. */
export function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= max) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded across the
  // process lifetime — cheap since it only runs on the ~1-in-50 request that
  // trips this branch, not every request.
  if (hits.size > 500 && Math.random() < 0.02) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return true;
}
