# Riemann Sums → The Integral

An interactive educational simulation that teaches one central idea:

> **A definite integral is the limit of Riemann-sum approximations as the number of rectangles increases and their width approaches zero.**

Built for a Class 11/12 mathematics concept as part of a Web Developer Internship hiring assessment. The app runs entirely in the browser — no backend, no database, no authentication.

---

## Overview

The simulation lets a student:

- Pick a function (`x²`, `x`, `sin(x)`, `x³`), an interval `[a, b]`, a number of rectangles `n`, and a sampling method (Left / Midpoint / Right).
- Watch rectangles render on a live coordinate graph that scales to the data.
- Read the live mathematics: `Δx`, the Riemann sum, the exact integral, absolute and percentage error.
- Press **Watch the Integral Emerge** to animate `n` from 2 → 256 and see the approximation converge to the exact area.
- Compare Left / Midpoint / Right sums side by side.
- See a real (not faked) error-vs-`n` chart that shrinks as `n` grows.

The graph is the visual centerpiece; every number on screen is computed from the current parameters.

---

## Pedagogical Choice

### What misconception does this simulation target?

> "How can a collection of rectangles possibly represent the area under a *curved* function?"

Students accept that a rectangle has an area, and that a curve has *some* area, but the bridge between the two — a limit of sums of rectangles — is usually taught symbolically and feels like a definition rather than a discovery.

### How does the visual architecture resolve it?

Instead of stating "the limit of the Riemann sum is the integral," the simulation lets the student **see the gap close**:

1. At `n = 4` the rectangles clearly over- or under-shoot the curve.
2. The **exact area is drawn as a dashed green outline** under the curve, so the "target" is always visible.
3. The **Aha Moment** animation grows `n` through 2 → 4 → 8 → … → 256. The student watches the rectangles thin out, hug the curve, and the blue approximation readout slide toward the green exact value.
4. A **prediction prompt** asks "what happens to the error?" *before* the animation, turning a passive animation into an active hypothesis test.
5. The **error chart** plots the actual calculated error at each power of two, giving a second, quantitative view of the same convergence.

The convergence is communicated by the visual change itself, not by a text popup — exactly the brief's requirement.

---

## Mathematical Foundation

All calculations live in `src/utils/` and are pure functions with no rendering concerns, so they can be explained and tested independently.

### Rectangle width

```
Δx = (b − a) / n
```

### Sample point

```
left:     xᵢ* = a + i·Δx          (left edge of subinterval i)
right:    xᵢ* = a + (i+1)·Δx      (right edge)
midpoint: xᵢ* = a + (i + ½)·Δx    (middle)
```

### Rectangle area and Riemann sum

```
areaᵢ = f(xᵢ*) · Δx
Sₙ    = Σᵢ₌₀ⁿ⁻¹ areaᵢ
```

### Exact definite integral (analytical, per function)

Implemented with the Fundamental Theorem of Calculus, `F(b) − F(a)`:

| f(x)   | F(x)       |
|--------|------------|
| x²     | x³ / 3     |
| x      | x² / 2     |
| sin(x) | −cos(x)    |
| x³     | x⁴ / 4     |

Only functions with a correct analytical integrator are offered. No fake exact values are ever displayed.

### Error

```
absolute error = |Sₙ − ∫|
percent error   = |Sₙ − ∫| / |∫| × 100
```

### Convergence

```
limₙ→∞ Sₙ = ∫ₐᵇ f(x) dx
```

For the default example `∫₀² x² dx = 8/3 ≈ 2.66667`, the midpoint sum at `n = 256` is `2.666656…`, an error of about `1.0 × 10⁻⁵` — visible convergence.

### Verified values (independent hand calculation)

| Case                           | Expected | Computed |
|--------------------------------|----------|----------|
| `x²`, [0,2], n=4, left         | 1.75     | 1.75     |
| `x²`, [0,2], n=4, right        | 3.75     | 3.75     |
| `x²`, [0,2], n=8, midpoint     | 2.65625  | 2.65625  |
| `x`, [0,2], n=4, midpoint      | 2.0      | 2.0      |
| `x²`, [0,2], n=1, midpoint     | 2.0      | 2.0      |
| `sin(x)`, [0,π], exact         | 2.0      | 2.0      |

The error at `n = 2, 4, 8, …, 256` (midpoint, `x²`, [0,2]) decreases monotonically, confirming the convergence the simulation is teaching.

---

## Features

- Live Riemann-sum graph on HTML5 Canvas with auto-scaling coordinate transformation.
- Functions: `x²`, `x`, `sin(x)`, `x³` (all with exact integrals).
- Methods: Left, Midpoint (default), Right — via a segmented control.
- Interval inputs `a`, `b` with `a < b` validation.
- Rectangle slider `n = 1 → 256`.
- Live math panel: `Δx`, sample rule, Riemann sum, exact integral, absolute & percent error.
- **Watch the Integral Emerge** animation stepping `n` through powers of two.
- Prediction interaction (Increase / Decrease / Stay the same) revealed after the animation.
- Left vs Midpoint vs Right comparison table with live errors.
- Error-vs-`n` SVG chart using real calculated errors (log-spaced x-axis).
- Five-step "How does a Riemann Sum work?" explanation.
- Responsive layout: graph + side controls on desktop; stacked on mobile/tablet.
- Keyboard-accessible controls, ARIA labels, readable contrast.

---

## Technology

- **React 18** + **JavaScript (JSX)**
- **Vite** build tool
- **Tailwind CSS** for styling
- **HTML5 Canvas** for the main graph
- **SVG** for the error chart
- **lucide-react** (available, used sparingly)

No backend, database, auth, charting library, or animation library. Everything runs in the browser.

---

## Project Structure

```
src/
  components/
    Header.jsx            # title + subtitle bar
    SimulationGraph.jsx   # canvas graph (coordinate mapper + draw)
    ControlPanel.jsx      # function / method / interval / n slider
    MathPanel.jsx         # live numerical readout
    AhaMoment.jsx         # convergence animation + prediction
    MethodComparison.jsx  # left/mid/right table
    ErrorChart.jsx        # error vs n (SVG)
    Explanation.jsx       # 5-step how-it-works
  hooks/
    useElementSize.js     # ResizeObserver hook
  utils/
    functions.js          # function definitions + exact integrals
    riemann.js            # Riemann sum, sample points, errors
    integration.js        # exact integral + number formatting
    coordinateMapper.js   # math ↔ screen transformation
  App.jsx
  main.jsx
```

Calculations are separated from rendering: `utils/` holds all math; `components/` only consume it.

---

## Run Locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

### Other scripts

```bash
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

---

## Deployment (Vercel)

1. Push this repository to GitHub.
2. In Vercel, **New Project → Import** the repository.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
4. Deploy. No environment variables are required.

(Or: `npm i -g vercel && vercel` from the project root.)

---

## Coordinate System (Canvas)

The graph never hard-codes pixel positions. A `CoordinateMapper` class converts math coordinates to screen pixels:

```
unit = min(pxWidth / (xMax−xMin), pxHeight / (yMax−yMin))   // uniform scale
screenX = ox + x · unit
screenY = oy − y · unit                                       // y is flipped
```

`ox, oy` are the screen position of the math origin. The view box is recomputed from the interval and the function's y-range on every render, so the curve and rectangles always fit. The canvas uses `devicePixelRatio` scaling for crisp rendering and a `ResizeObserver` so it resizes without breaking the coordinate system.

---

## How the Aha Moment Works

`AhaMoment` runs a `requestAnimationFrame` loop that advances through the fixed sequence `[2, 4, 8, 16, 32, 64, 128, 256]`, dwelling ~950 ms on each value. On each step it calls `setN(value)`, which updates the shared `n` state in `App`, so the graph, math panel, comparison table, and error chart all react to the same source of truth. Before starting, the student picks a prediction; after the final step the actual final approximation vs. the exact integral is revealed along with the takeaway sentence. Manual controls are disabled while the animation runs.

---

## AI Disclosure

This project was built with AI assistance (Claude). In the spirit of the assignment's "AI curation and critical thinking" criterion, here is an honest account.

### What AI helped with

- Scaffolding the React component structure.
- Drafting the canvas rendering loop and the `CoordinateMapper` class.
- Writing the Tailwind styling and responsive layout.
- Drafting this README.

### What was manually reviewed and verified

- **Every Riemann-sum formula** was re-derived by hand and checked against an independent Node script (see the "Verified values" table above).
- **Exact integrals** were checked against the Fundamental Theorem of Calculus (`F(b) − F(a)`).
- **Edge cases**: `n = 1` (single rectangle), `n = 256` (many), invalid interval `a ≥ b`, and the `sin(x)` case (radians, signed area) were all tested.
- The **convergence** was confirmed to be monotonic for the default example.
- Coordinate transformation was checked so that rectangles, the curve, and axis labels stay aligned after resize.

### Bugs / issues discovered and corrected during development

- **n = 1 mental-arithmetic trap.** While sanity-checking, I initially expected the `n = 1` midpoint sum of `x²` on `[0,2]` to be `1` (the value of `f(1)`). The code returned `2`. The code was **correct** — a single rectangle has width `Δx = 2`, so its area is `f(1)·2 = 2`, not `f(1)`. This is a good reminder that the Riemann sum is `f(xᵢ*) · Δx`, not `f(xᵢ*)`. No code change was needed; the misunderstanding was mine.
- **`∫₀² x dx` expectation.** An early test expected the midpoint sum of `x` on `[0,2]` to be `1`; the code returned `2`. Again the code was right — the exact integral is `2`, and the midpoint rule is exact for linear functions. Corrected the test, not the code.
- **Aha animation state ordering.** The first draft declared a `useRef` *after* the `useEffect` that read it, which would have read a stale ref. Reordered so the ref is declared before the effect.
- **`setInterval` naming.** `setInterval` shadows the global `window.setInterval`; the prop was renamed `setIntervalAB` in `App` to avoid confusion and accidental timers.

No fabricated AI mistakes are listed here — only issues that actually occurred.

---

## Things to Understand Before the Technical Walkthrough

1. **The Riemann sum formula** — be able to write `Δx = (b−a)/n`, the three sample-point rules, and `Sₙ = Σ f(xᵢ*)·Δx` from memory.
2. **`coordinateMapper.js`** — explain `unit`, `ox`, `oy`, and why `screenY = oy − y·unit` (y-axis flip).
3. **`riemann.js`** — walk through `riemannSum()` loop: subinterval edges, sample point, height, area, accumulation.
4. **`functions.js` exact integrals** — state each antiderivative and that the exact value is `F(b) − F(a)`.
5. **The Aha Moment** — explain the `requestAnimationFrame` loop, the fixed `N_SEQUENCE`, and that it drives the same `n` state as the slider.
6. **Why midpoint is exact for linear functions** — the midpoint rule samples the average height of a linear function, so the error is zero regardless of `n`.
7. **Why the error chart is log-spaced on x** — the sequence doubles, so linear spacing would cram the small-`n` points together.
8. **The prediction interaction** — it exists to make the animation an active hypothesis test, not passive viewing.
#   r i e m a n n - s u m - v i s u a l i z e r  
 