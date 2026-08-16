import { useEffect, useRef } from "react";
import {
  CoordinateMapper,
  computeViewBox,
  niceStep,
} from "@/utils/coordinateMapper";
import { riemannSum } from "@/utils/riemann";

const PAD = { top: 20, right: 20, bottom: 36, left: 48 };

export default function SimulationGraph({
  fn,
  a,
  b,
  dx,
  rectangles,
  method,
  approximate,
  exact,
  rectOpacity = 1,
  transition = null,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let raf = 0;
    const draw = () => {
      raf = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = wrap.clientWidth;
      const cssH = wrap.clientHeight;
      if (cssW === 0 || cssH === 0) return;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      renderScene(ctx, cssW, cssH, {
        fn,
        a,
        b,
        dx,
        rectangles,
        method,
        approximate,
        exact,
        rectOpacity,
        transition,
      });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(draw);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fn, a, b, dx, rectangles, method, approximate, exact, rectOpacity, transition]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-[clamp(420px,58vh,720px)] min-h-[420px]"
      role="img"
      aria-label={`Riemann sum graph of ${fn.formula} on [${a}, ${b}] with ${rectangles.length} rectangles using the ${method} method. Approximate area ${approximate.toFixed(5)}.`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

function renderScene(ctx, cssW, cssH, p) {
  const f = p.fn.f;
  const transitionRects = getTransitionRectangles(p);
  const drawRectangles = transitionRects ?? p.rectangles;

  // Sample the curve across the visible x-range for view-box + drawing.
  const xLo = p.a - 0.6;
  const xHi = p.b + 0.6;
  const samples = 240;
  const curve = [];
  for (let i = 0; i <= samples; i++) {
    const x = xLo + ((xHi - xLo) * i) / samples;
    curve.push({ x, y: f(x) });
  }
  const yVals = curve.map((c) => c.y);
  // Include rectangle tops so they're always visible.
  for (const r of drawRectangles) yVals.push(r.height);

  const view = computeViewBox(p.a, p.b, yVals);
  const px = {
    x: PAD.left,
    y: PAD.top,
    width: cssW - PAD.left - PAD.right,
    height: cssH - PAD.top - PAD.bottom,
  };
  const m = new CoordinateMapper(view, px);

  // --- Grid ---
  const stepX = niceStep(view.xMax - view.xMin, 9);
  const stepY = niceStep(view.yMax - view.yMin, 6);
  ctx.lineWidth = 1;
  ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  // vertical gridlines + x labels
  for (let gx = Math.ceil(view.xMin / stepX) * stepX; gx <= view.xMax + 1e-9; gx += stepX) {
    const sx = m.toScreenX(gx);
    ctx.strokeStyle = Math.abs(gx) < 1e-9 ? "rgb(148 163 184)" : "rgb(241 245 249)";
    ctx.beginPath();
    ctx.moveTo(sx, px.y);
    ctx.lineTo(sx, px.y + px.height);
    ctx.stroke();
    if (Math.abs(gx) > 1e-9) {
      ctx.fillStyle = "rgb(100 116 139)";
      ctx.fillText(trimNum(gx), sx, px.y + px.height + 6);
    }
  }
  // horizontal gridlines + y labels
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let gy = Math.ceil(view.yMin / stepY) * stepY; gy <= view.yMax + 1e-9; gy += stepY) {
    const sy = m.toScreenY(gy);
    ctx.strokeStyle = Math.abs(gy) < 1e-9 ? "rgb(148 163 184)" : "rgb(241 245 249)";
    ctx.beginPath();
    ctx.moveTo(px.x, sy);
    ctx.lineTo(px.x + px.width, sy);
    ctx.stroke();
    if (Math.abs(gy) > 1e-9) {
      ctx.fillStyle = "rgb(100 116 139)";
      ctx.fillText(trimNum(gy), px.x - 6, sy);
    }
  }

  // --- Axis labels (0) ---
  ctx.fillStyle = "rgb(100 116 139)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText("0", m.toScreenX(0) - 4, m.toScreenY(0) + 4);

  // --- Rectangles ---
  const op = p.rectOpacity;
  const nForEmphasis = drawRectangles.length;
  const strokeAlpha = nForEmphasis <= 8 ? 0.98 : nForEmphasis <= 32 ? 0.88 : 0.72;
  const fillAlphaBase = nForEmphasis <= 8 ? 0.32 : nForEmphasis <= 32 ? 0.24 : 0.16;
  for (const r of drawRectangles) {
    const sx0 = m.toScreenX(r.x0);
    const sx1 = m.toScreenX(r.x1);
    const syH = m.toScreenY(r.height);
    const sy0 = m.toScreenY(0);
    const top = Math.min(syH, sy0);
    const h = Math.abs(syH - sy0);
    const w = sx1 - sx0;
    // Fill: blue, semi-transparent; signed area handled by drawing across x-axis.
    const localOpacity = Number.isFinite(r.opacity) ? r.opacity : 1;
    ctx.fillStyle = r.height >= 0
      ? `rgba(59,130,246,${fillAlphaBase * op * localOpacity})`
      : `rgba(239,68,68,${fillAlphaBase * op * localOpacity})`;
    ctx.fillRect(sx0, top, Math.max(w - 0.5, 0.5), h);
    ctx.strokeStyle = r.height >= 0
      ? `rgba(37,99,235,${strokeAlpha * op * localOpacity})`
      : `rgba(220,38,38,${strokeAlpha * op * localOpacity})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(sx0 + 0.25, top + 0.25, Math.max(w - 0.5, 0.5), Math.max(h - 0.5, 0.5));
  }

  // --- Exact area shading reference (thin hatched band under curve on [a,b]) ---
  if (p.exact !== null) {
    ctx.save();
    ctx.beginPath();
    const ax = m.toScreenX(p.a);
    const bx = m.toScreenX(p.b);
    const y0s = m.toScreenY(0);
    ctx.moveTo(ax, y0s);
    const ns = 120;
    for (let i = 0; i <= ns; i++) {
      const x = p.a + ((p.b - p.a) * i) / ns;
      ctx.lineTo(m.toScreenX(x), m.toScreenY(f(x)));
    }
    ctx.lineTo(bx, y0s);
    ctx.closePath();
    ctx.strokeStyle = "rgba(16,185,129,0.5)";
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // --- Function curve ---
  ctx.beginPath();
  let started = false;
  for (const c of curve) {
    const [sx, sy] = m.toScreen(c.x, c.y);
    if (!started) {
      ctx.moveTo(sx, sy);
      started = true;
    } else ctx.lineTo(sx, sy);
  }
  ctx.strokeStyle = "rgb(15,23,42)";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  // --- [a,b] interval ticks + labels ---
  ctx.fillStyle = "rgb(51,65,85)";
  ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const [val, lbl] of [[p.a, "a"], [p.b, "b"]]) {
    const sx = m.toScreenX(val);
    ctx.strokeStyle = "rgb(71,85,105)";
    ctx.beginPath();
    ctx.moveTo(sx, m.toScreenY(0) - 4);
    ctx.lineTo(sx, m.toScreenY(0) + 4);
    ctx.stroke();
    ctx.fillText(`${lbl}=${trimNum(val)}`, sx, m.toScreenY(0) + 8);
  }

  // --- Legend / readout (top-left inside plot) ---
  ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const lx = px.x + 8;
  let ly = px.y + 6;
  const lineH = 16;
  ctx.fillStyle = "rgb(37,99,235)";
  ctx.fillText(`Approx = ${trimNum(p.approximate, 5)}`, lx, ly);
  ly += lineH;
  if (p.exact !== null) {
    ctx.fillStyle = "rgb(5,150,105)";
    ctx.fillText(`Exact   = ${trimNum(p.exact, 5)}`, lx, ly);
  }
}

function getTransitionRectangles(p) {
  if (!p.transition || !p.transition.active) return null;
  const fromN = p.transition.fromN;
  const toN = p.transition.toN;
  if (!Number.isFinite(fromN) || !Number.isFinite(toN) || toN !== fromN * 2) {
    return null;
  }

  const fromRectangles = riemannSum(p.fn, p.a, p.b, fromN, p.method).rectangles;
  const toRectangles = riemannSum(p.fn, p.a, p.b, toN, p.method).rectangles;
  const t = easeInOut(clamp01(p.transition.progress ?? 0));
  const rectangles = [];

  for (let i = 0; i < fromRectangles.length; i++) {
    const parent = fromRectangles[i];
    const leftChild = toRectangles[i * 2];
    const rightChild = toRectangles[i * 2 + 1];
    if (!parent || !leftChild || !rightChild) continue;

    const mid = (parent.x0 + parent.x1) / 2;

    // Fade the parent out while the two children grow out from the split point.
    rectangles.push({
      x0: parent.x0,
      x1: parent.x1,
      height: lerp(parent.height, (leftChild.height + rightChild.height) / 2, t),
      sample: parent.sample,
      area: parent.area,
      opacity: 1 - t,
    });

    rectangles.push({
      x0: lerp(mid, leftChild.x0, t),
      x1: lerp(mid, leftChild.x1, t),
      height: lerp(parent.height, leftChild.height, t),
      sample: leftChild.sample,
      area: leftChild.area,
      opacity: t,
    });

    rectangles.push({
      x0: lerp(mid, rightChild.x0, t),
      x1: lerp(mid, rightChild.x1, t),
      height: lerp(parent.height, rightChild.height, t),
      sample: rightChild.sample,
      area: rightChild.area,
      opacity: t,
    });
  }

  return rectangles;
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function trimNum(v, digits = 2) {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) < 1e-9) return "0";
  return Number(v.toFixed(digits)).toString();
}
