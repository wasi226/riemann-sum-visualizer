import { useEffect, useRef, useState } from "react";
import { riemannSum, N_SEQUENCE } from "@/utils/riemann";
import { exactIntegral, fmt } from "@/utils/integration";

export default function AhaMoment({
  fn,
  a,
  b,
  method,
  n,
  setN,
  running,
  setRunning,
}) {
  const [prediction, setPrediction] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const stepIdxRef = useRef(0);
  stepIdxRef.current = stepIdx;
  const rafRef = useRef(0);
  const startRef = useRef(0);

  const DWELL = 950;

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    setStepIdx(0);
    setN(N_SEQUENCE[0]);

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const idx = Math.min(
        N_SEQUENCE.length - 1,
        Math.floor(elapsed / DWELL),
      );
      if (idx !== stepIdxRef.current) {
        stepIdxRef.current = idx;
        setStepIdx(idx);
        setN(N_SEQUENCE[idx]);
      }
      if (elapsed >= DWELL * N_SEQUENCE.length) {
        setRunning(false);
        setRevealed(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const startAnimation = () => {
    setRevealed(false);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setRevealed(false);
    setPrediction(null);
    setN(8);
  };

  const exact = exactIntegral(fn, a, b);
  const finalN = N_SEQUENCE[N_SEQUENCE.length - 1];
  const finalApprox = riemannSum(fn, a, b, finalN, method).sum;

  return (
    <section
      aria-label="Aha moment"
      className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Watch the Integral Emerge
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Press play. We'll grow the rectangles from 2 to 256 — watch them
            thin out and hug the curve.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={startAnimation}
            disabled={running}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {running ? "Running…" : "Watch the Integral Emerge"}
          </button>
          <button
            onClick={reset}
            disabled={running}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {N_SEQUENCE.map((nv, i) => {
          const active = i <= stepIdx;
          const current = running && i === stepIdx;
          return (
            <span
              key={nv}
              className={`min-w-[3.5rem] rounded-md px-2 py-1 text-center font-mono text-xs transition ${
                current
                  ? "bg-blue-600 text-white shadow"
                  : active
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              n={nv}
            </span>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-700">
          Before you watch — what happens to the error as we use more rectangles?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["increase", "decrease", "same"].map((opt) => {
            const selected = prediction === opt;
            const isCorrect = opt === "decrease";
            const showResult = revealed && selected;
            return (
              <button
                key={opt}
                onClick={() => setPrediction(opt)}
                disabled={running}
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1 text-sm transition disabled:opacity-60 ${
                  showResult
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-red-400 bg-red-50 text-red-700"
                    : selected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt === "increase"
                  ? "Increase"
                  : opt === "decrease"
                    ? "Decrease"
                    : "Stay about the same"}
                {showResult && (isCorrect ? " — correct" : " — try the animation")}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-slate-700">
            <p>
              At <span className="font-mono">n = {finalN}</span>, the {method} sum
              is <span className="font-mono text-blue-700">{fmt(finalApprox)}</span>
              {exact !== null && (
                <>
                  {" "}vs exact <span className="font-mono text-emerald-700">{fmt(exact)}</span>.
                </>
              )}
            </p>
            <p className="mt-2 font-medium text-slate-900">
              More rectangles → thinner strips → the rectangle total becomes the
              exact area under the curve. That's what a definite integral is.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

