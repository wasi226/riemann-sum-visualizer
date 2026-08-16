import { riemannSum, METHOD_LABELS } from "@/utils/riemann";
import { exactIntegral, fmt } from "@/utils/integration";

const METHODS = ["left", "midpoint", "right"];

export default function MethodComparison({
  fn,
  a,
  b,
  n,
  current,
}) {
  const exact = exactIntegral(fn, a, b);
  const values = METHODS.map((m) => ({
    method: m,
    sum: riemannSum(fn, a, b, n, m).sum,
  }));

  return (
    <section
      aria-label="Method comparison"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Compare the three methods
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Each way of measuring the height gives a slightly different total, but
        all three reach the same true area as you add rectangles.
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2 text-right">Total (n = {n})</th>
              <th className="px-3 py-2 text-right">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {values.map((v) => {
              const isCurrent = v.method === current;
              const err = exact === null ? NaN : Math.abs(v.sum - exact);
              return (
                <tr
                  key={v.method}
                  className={isCurrent ? "bg-blue-50" : "bg-white"}
                >
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-800">
                      {METHOD_LABELS[v.method]}
                    </span>
                    {isCurrent && (
                      <span className="ml-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        current
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-900">
                    {fmt(v.sum)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-600">
                    {Number.isFinite(err) ? fmt(err) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-emerald-50">
              <td className="px-3 py-2 font-medium text-emerald-800">Exact</td>
              <td className="px-3 py-2 text-right font-mono text-emerald-700">
                {exact === null ? "—" : fmt(exact)}
              </td>
              <td className="px-3 py-2 text-right font-mono text-emerald-600">0</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Function: <span className="font-mono">{fn.formula}</span> on
        [<span className="font-mono">{fmt(a)}</span>, <span className="font-mono">{fmt(b)}</span>].
      </p>
    </section>
  );
}

