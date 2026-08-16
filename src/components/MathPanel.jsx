import { METHOD_LABELS } from "@/utils/riemann";
import { fmt } from "@/utils/integration";

export default function MathPanel({
  fn,
  a,
  b,
  n,
  dx,
  method,
  approximate,
  exact,
  absError,
  pctError,
}) {
  const sampleExpr =
    method === "left"
      ? "left edge of each strip"
      : method === "right"
        ? "right edge of each strip"
        : "middle of each strip";

  return (
    <section
      aria-label="Live mathematics"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        The Numbers
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Everything updates as you change the controls.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Row
          label="Strip width"
          hint="Each rectangle's width"
          expr="Δx = (b − a) / n"
          value={`Δx = ${fmt(dx)}`}
        />
        <Row
          label="Height measured at"
          hint={sampleExpr}
          expr={`using the ${method} method`}
          value={METHOD_LABELS[method]}
        />
        <Row
          label="Rectangle total (approx)"
          hint="Add up all the rectangles"
          expr={`Σ f(xᵢ*) · Δx,  n = ${n}`}
          value={fmt(approximate)}
          highlight
        />
        <Row
          label="True area (exact)"
          hint={`${fn.antiderivative}, then F(b) − F(a)`}
          expr={`on [${fmt(a)}, ${fmt(b)}]`}
          value={exact === null ? "—" : fmt(exact)}
          exact
        />
        <Row
          label="How far off"
          hint="Approx minus true area"
          expr="|Σ − ∫|"
          value={fmt(absError)}
        />
        <Row
          label="Error as a %"
          hint="Smaller is closer"
          expr="|Σ − ∫| / |∫| × 100"
          value={Number.isFinite(pctError) ? `${fmt(pctError, 4)}%` : "—"}
        />
      </dl>

      {exact !== null && (
        <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-slate-700">
          The rectangle total is{" "}
          <span className="font-medium text-blue-700">{fmt(approximate)}</span>{" "}
          and the true area is{" "}
          <span className="font-medium text-emerald-700">{fmt(exact)}</span>.
          They get closer as you add more rectangles.
        </p>
      )}
    </section>
  );
}

function Row({ label, hint, expr, value, highlight, exact }) {
  const valueColor = exact
    ? "text-emerald-700"
    : highlight
      ? "text-blue-700"
      : "text-slate-900";
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className={`mt-0.5 font-mono text-sm ${valueColor}`}>{value}</dd>
      <span className="mt-0.5 text-[11px] text-slate-400">{hint}</span>
      <span className="mt-0.5 font-mono text-[11px] text-slate-400">{expr}</span>
    </div>
  );
}
