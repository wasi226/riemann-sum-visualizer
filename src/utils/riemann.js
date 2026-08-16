export const METHOD_LABELS = {
  left: "Left",
  midpoint: "Midpoint",
  right: "Right",
};

export function samplePoint(method, x0, x1) {
  switch (method) {
    case "left":
      return x0;
    case "right":
      return x1;
    case "midpoint":
    default:
      return (x0 + x1) / 2;
  }
}

export function riemannSum(fn, a, b, n, method) {
  const f = fn.f;
  const dx = (b - a) / n;
  const rectangles = [];
  let sum = 0;

  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx;
    const x1 = x0 + dx;
    const sample = samplePoint(method, x0, x1);
    const height = f(sample);
    const area = height * dx;
    sum += area;
    rectangles.push({ x0, x1, sample, height, area });
  }

  return { sum, rectangles, dx };
}

export function absoluteError(approx, exact) {
  if (exact === null) return NaN;
  if (exact === 0) return Math.abs(approx);
  return Math.abs(approx - exact);
}

export function percentError(approx, exact) {
  if (exact === null || exact === 0) return NaN;
  return (Math.abs(approx - exact) / Math.abs(exact)) * 100;
}

export const N_SEQUENCE = [2, 4, 8, 16, 32, 64, 128, 256];
