/**
 * Exact definite integral of the given function over [a, b].
 * Returns null if the function has no analytical integrator (e.g. custom).
 */
export function exactIntegral(fn, a, b) {
  if (!fn.exact) return null;
  return fn.exact(a, b);
}

/** Format a number for compact display (handles very small / large). */
export function fmt(value, digits = 5) {
  if (!Number.isFinite(value)) return "—";
  if (value !== 0 && Math.abs(value) < 1e-4) {
    return value.toExponential(2);
  }
  return Number(value.toFixed(digits)).toString();
}
