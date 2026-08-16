/**
 * Parse a user-typed math expression (like "x^2 + sin(x)") into a numeric
 * function f(x). Returns { fn, error } so the caller can show a friendly
 * message instead of crashing.
 *
 * How it works (safe enough for a local educational tool):
 *  1. Rewrite common math shorthand:
 *       ^   -> **      (power)
 *       pi  -> PI
 *       e   -> E
 *  2. Build the function with `new Function("x", body)` but expose ONLY
 *     Math.* functions and constants as the scope — no window, no globals.
 *  3. Evaluate once at x = 1 to catch syntax errors early.
 *
 * The user is typing their own expression to graph; they are not running
 * someone else's code, so this is acceptable for the assignment scope.
 */
export function parseFunction(input) {
  const raw = input.trim();
  if (!raw) return { fn: null, error: "Type a function, e.g. x^2 + 1" };

  // ^ -> ** for exponentiation
  let body = raw.replace(/\^/g, "**");
  // allow bare "pi" and "e" as constants
  body = body.replace(/\bpi\b/g, "PI").replace(/\be\b/g, "E");

  // Names the expression is allowed to use (exposed as scope).
  const ALLOWED = new Set([
    "x",
    "PI",
    "E",
    "sin", "cos", "tan", "asin", "acos", "atan",
    "sqrt", "abs", "exp", "log", "log2", "log10",
    "pow", "min", "max", "floor", "ceil", "round",
    "sign", "cbrt", "sinh", "cosh", "tanh",
  ]);

  // Collect identifiers in the body and reject anything not allowed.
  const ids = body.match(/[a-zA-Z_]\w*/g) ?? [];
  for (const id of ids) {
    if (!ALLOWED.has(id)) {
      return { fn: null, error: `Unknown name "${id}" — use sin, cos, sqrt, etc.` };
    }
  }

  let fn;
  try {
    // eslint-disable-next-line no-new-func
    const builder = new Function(
      "x",
      `"use strict"; const {PI,E,sin,cos,tan,asin,acos,atan,sqrt,abs,exp,log,log2,log10,pow,min,max,floor,ceil,round,sign,cbrt,sinh,cosh,tanh}=Math; return (${body});`,
    );
    fn = builder;
  } catch {
    return { fn: null, error: "Couldn't understand that expression." };
  }

  // Sanity check at a couple of points so we fail fast on bad syntax.
  for (const testX of [0, 1, -1]) {
    try {
      const v = fn(testX);
      if (typeof v !== "number") {
        return { fn: null, error: "The expression must produce a number." };
      }
    } catch {
      return { fn: null, error: "Couldn't evaluate that expression." };
    }
  }

  return { fn, error: null };
}

/** Build a full FnDef for a custom expression (no exact integral available). */
export function makeCustomFnDef(input, fn) {
  return {
    id: "custom",
    label: input.trim(),
    formula: `f(x) = ${input.trim()}`,
    f: fn,
    exact: null,
    antiderivative: "not known (custom)",
    hint: "Your custom function",
  };
}
