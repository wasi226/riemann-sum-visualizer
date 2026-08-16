const STEPS = [
  {
    n: 1,
    title: "Divide",
    body: "Cut the region from a to b into n equal strips, side by side.",
    expr: "Δx = (b − a) / n",
  },
  {
    n: 2,
    title: "Choose",
    body: "Pick one spot in each strip — the left edge, the middle, or the right edge.",
    expr: "xᵢ* ∈ strip i",
  },
  {
    n: 3,
    title: "Build",
    body: "Make a rectangle from each strip. Its width is Δx and its height is the curve's value at that spot.",
    expr: "areaᵢ = f(xᵢ*) · Δx",
  },
  {
    n: 4,
    title: "Add",
    body: "Add up every rectangle's area. That total is our guess for the area under the curve.",
    expr: "Sₙ = Σᵢ f(xᵢ*) · Δx",
  },
  {
    n: 5,
    title: "Converge",
    body: "Use more and more rectangles. The strips get thinner, the guess gets better, and it lands on the true area.",
    expr: "limₙ→∞ Sₙ = ∫ₐᵇ f(x) dx",
  },
];

export default function Explanation() {
  return (
    <section
      aria-label="How does a Riemann sum work"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        How does a Riemann Sum work?
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Five steps from rectangles to a curved area — read left to right.
      </p>

      <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="relative rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {s.n}
            </span>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              {s.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {s.body}
            </p>
            <p className="mt-2 font-mono text-[11px] text-blue-700">{s.expr}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
