# Riemann Sums to the Integral

Live demo: https://riemann-sum-visualizer.vercel.app/

An interactive browser simulation that teaches one core idea:

> A definite integral is the limit of Riemann-sum approximations as the number of rectangles increases and rectangle width approaches zero.

This project was built for a Class 11/12 mathematics concept as part of a Web Developer Internship assessment.

## What This App Does

Students can:

- Choose a function: `x^2`, `x`, `sin(x)`, `x^3`
- Set an interval `[a, b]`
- Choose the number of rectangles `n`
- Switch sampling rule: Left, Midpoint, Right
- See rectangles drawn live on a responsive coordinate graph
- View live math values: `Delta x`, Riemann sum, exact integral, absolute error, percent error
- Run "Watch the Integral Emerge" to animate `n` from `2` to `256`
- Compare Left vs Midpoint vs Right side by side
- View a real error-vs-`n` chart (computed values, not mocked)

All calculations are driven by current UI inputs. No hardcoded result values are shown to users.

## Pedagogical Goal

### Misconception Targeted

A common student confusion is:

"How can rectangles represent the area under a curved graph?"

### How the Visual Design Solves It

Instead of only defining limits symbolically, the app lets students watch convergence happen:

1. At low `n`, rectangles visibly over/under-approximate the curve.
2. Exact area is shown under the curve as a constant target.
3. The animation steps `n` through powers of two (`2, 4, 8, ..., 256`).
4. Students make a prediction before animation (error increase/decrease/same).
5. The error chart confirms convergence numerically.

The concept is communicated by visual evidence first, then formulas.

## Mathematical Foundation

All math logic is implemented as pure utility functions in `src/utils`.

### Rectangle Width

```text
Delta x = (b - a) / n
```

### Sample Points

```text
Left:     x_i* = a + i * Delta x
Right:    x_i* = a + (i + 1) * Delta x
Midpoint: x_i* = a + (i + 0.5) * Delta x
```

### Rectangle Area and Riemann Sum

```text
area_i = f(x_i*) * Delta x
S_n    = sum from i=0 to n-1 of area_i
```

### Exact Integral

Exact values are computed analytically using:

```text
Integral_a_to_b f(x) dx = F(b) - F(a)
```

Implemented antiderivatives:

| f(x)   | F(x)     |
|--------|----------|
| x^2    | x^3 / 3  |
| x      | x^2 / 2  |
| sin(x) | -cos(x)  |
| x^3    | x^4 / 4  |

### Error Metrics

```text
absolute error = |S_n - exact|
percent error  = (|S_n - exact| / |exact|) * 100
```

### Convergence Statement

```text
limit as n -> infinity of S_n = Integral_a_to_b f(x) dx
```

For default case `f(x)=x^2`, `[0,2]`, exact value is `8/3 ~= 2.66667`.
At `n=256` midpoint rule gives approximately `2.666656`.

## Verified Numerical Checks

Independent hand-calculation checks:

| Case                       | Expected | Computed |
|----------------------------|----------|----------|
| x^2, [0,2], n=4, left      | 1.75     | 1.75     |
| x^2, [0,2], n=4, right     | 3.75     | 3.75     |
| x^2, [0,2], n=8, midpoint  | 2.65625  | 2.65625  |
| x, [0,2], n=4, midpoint    | 2.0      | 2.0      |
| x^2, [0,2], n=1, midpoint  | 2.0      | 2.0      |
| sin(x), [0,pi], exact      | 2.0      | 2.0      |

Error for midpoint `x^2` on `[0,2]` decreases monotonically for:
`n = 2, 4, 8, ..., 256`.

## Features

- Live Riemann-sum graph on HTML5 Canvas
- Auto-scaling coordinate mapping
- Left / Midpoint / Right sampling rules
- Interval validation (`a < b`)
- Rectangle slider (`n = 1` to `256`)
- Live math panel with exact vs approximation and error
- "Watch the Integral Emerge" convergence animation
- Prediction interaction before animation
- Method comparison table (Left/Midpoint/Right)
- SVG error-vs-`n` chart (real computed values)
- Five-step conceptual explanation panel
- Responsive layout for desktop/tablet/mobile
- Keyboard-accessible controls with ARIA labels

## Tech Stack

- React 18
- JavaScript (JSX)
- Vite
- Tailwind CSS
- HTML5 Canvas (main graph)
- SVG (error chart)
- lucide-react (light usage)

No backend, database, authentication, charting library, or animation library.

## Project Structure

```text
src/
  components/
    Header.jsx
    SimulationGraph.jsx
    ControlPanel.jsx
    MathPanel.jsx
    AhaMoment.jsx
    MethodComparison.jsx
    ErrorChart.jsx
    Explanation.jsx
  hooks/
    useElementSize.js
  utils/
    functions.js
    riemann.js
    integration.js
    coordinateMapper.js
  App.jsx
  main.jsx
```

Separation of concerns:

- `src/utils`: all mathematics
- `src/components`: rendering and interaction

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (commonly `http://localhost:5173`).

Other scripts:

```bash
npm run build
npm run typecheck
npm run lint
```

## Deployment (Vercel)

Live app: https://riemann-sum-visualizer.vercel.app/

1. Push repository to GitHub.
2. In Vercel: New Project -> Import repository.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

No environment variables required.

CLI option:

```bash
npm i -g vercel
vercel
```

## Coordinate System Notes

Canvas rendering uses a mapper from math coordinates to pixels:

```text
unit    = min(pxWidth/(xMax-xMin), pxHeight/(yMax-yMin))
screenX = ox + x * unit
screenY = oy - y * unit
```

`oy - y * unit` is used because screen y increases downward.

The graph recomputes view bounds on each render based on current interval and function range.
A `ResizeObserver` and device-pixel-ratio scaling keep rendering crisp and aligned.

## How "Watch the Integral Emerge" Works

- Fixed sequence: `[2, 4, 8, 16, 32, 64, 128, 256]`
- Timing loop: `requestAnimationFrame`
- Each step updates shared state `n`
- Graph, math panel, comparison table, and error chart all react from one source of truth
- Manual controls are disabled while animation is active

## AI Disclosure

This project was built with AI assistance (Claude), then manually reviewed.

AI helped with:

- Initial React scaffolding
- First drafts of canvas rendering flow
- Initial Tailwind layout/style draft
- Initial README drafting

Manually verified:

- Riemann-sum formulas by hand
- Exact integral formulas via `F(b) - F(a)`
- Edge cases (`n=1`, `n=256`, `a>=b`, `sin(x)` in radians)
- Convergence trend behavior
- Coordinate alignment after resize

## Common Technical Walkthrough Questions

1. Derive and explain `Delta x`, sample points, and `S_n`.
2. Explain coordinate mapping and y-axis flip in `coordinateMapper.js`.
3. Walk through accumulation logic in `riemann.js`.
4. Explain exact integral mapping in `functions.js`.
5. Explain the animation sequence and shared state flow.
6. Explain why midpoint is exact for linear functions.
7. Explain why error chart x-axis is log-spaced.
8. Explain purpose of prediction prompt (active hypothesis testing).
