/**
 * Mathematical ↔ screen coordinate transformation.
 *
 * The graph lives in math-space [xMin..xMax] x [yMin..yMax]. We map that
 * rectangle into a pixel sub-rectangle of the canvas (with padding), using a
 * single uniform scale so 1 unit in x has the same visual weight everywhere.
 */

export class CoordinateMapper {
  constructor(view, px) {
    this.view = view;
    this.px = px;

    const xRange = view.xMax - view.xMin;
    const yRange = view.yMax - view.yMin;
    const sx = px.width / xRange;
    const sy = px.height / yRange;
    this.unit = Math.min(sx, sy);

    // Origin in math space, in pixels relative to px box.
    const originRelX = (0 - view.xMin) * this.unit;
    const originRelY = (view.yMax - 0) * this.unit; // y flipped
    this.ox = px.x + originRelX;
    this.oy = px.y + originRelY;
  }

  toScreenX(x) {
    return this.ox + x * this.unit;
  }
  toScreenY(y) {
    return this.oy - y * this.unit;
  }
  toScreen(x, y) {
    return [this.toScreenX(x), this.toScreenY(y)];
  }
  dxToScreen(d) {
    return d * this.unit;
  }
}

/**
 * Choose a viewing window that comfortably contains:
 *   - the interval [a, b] on x
 *   - the function values over that interval, the rectangle tops, and 0 on y
 * Adds padding on all sides. Used by the graph component.
 */
export function computeViewBox(a, b, yValues) {
  const xPad = 0.6;
  let yMin = 0;
  let yMax = 0;
  for (const v of yValues) {
    if (v < yMin) yMin = v;
    if (v > yMax) yMax = v;
  }
  // Always show the x-axis (y=0).
  if (yMin > 0) yMin = 0;
  if (yMax < 0) yMax = 0;
  const yRange = yMax - yMin;
  const yPad = Math.max(0.4, yRange * 0.12);
  // Guard against a zero-height range.
  const yLo = yMin - yPad;
  const yHi = yMax + yPad;
  return {
    xMin: a - xPad,
    xMax: b + xPad,
    yMin: yLo,
    yMax: yHi === yLo ? yLo + 1 : yHi,
  };
}

/** "Nice" step size for grid lines given a range and target tick count. */
export function niceStep(range, targetTicks = 8) {
  const rough = range / targetTicks;
  const pow10 = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / pow10;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * pow10;
}
