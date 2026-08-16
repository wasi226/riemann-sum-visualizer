import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONVERGENCE_SEQUENCE,
  STAGE_MESSAGES,
  SUBDIVISION_SEQUENCE,
} from "@/utils/riemann";
import { fmt } from "@/utils/integration";

const TRANSITION_MS = 780;
const HOLD_MS = 760;
const SUBDIVISION_STEP_MS = 880;

export default function AhaMoment({
  fn,
  a,
  b,
  method,
  n,
  dx,
  approximate,
  exact,
  absError,
  pctError,
  setN,
  running,
  setRunning,
  setGraphTransition,
}) {
  const [prediction, setPrediction] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progressRatio, setProgressRatio] = useState(0);

  const [subdivisionOpen, setSubdivisionOpen] = useState(false);
  const [subdivisionRunning, setSubdivisionRunning] = useState(false);
  const [subdivisionPaused, setSubdivisionPaused] = useState(false);
  const [subdivisionStepIdx, setSubdivisionStepIdx] = useState(0);
  const [focusMode, setFocusMode] = useState("middle");

  const convergenceRafRef = useRef(0);
  const lastTsRef = useRef(0);
  const stageIdxRef = useRef(0);
  const stageElapsedRef = useRef(0);

  const subdivisionRafRef = useRef(0);
  const subdivisionLastTsRef = useRef(0);
  const subdivisionElapsedRef = useRef(0);
  const subdivisionIdxRef = useRef(0);

  const stageMessage = STAGE_MESSAGES[n] ?? "More rectangles continue refining the approximation.";
  const currentProgressText = `n = ${n} / ${CONVERGENCE_SEQUENCE[CONVERGENCE_SEQUENCE.length - 1]}`;

  const subdivisionN = SUBDIVISION_SEQUENCE[subdivisionStepIdx];
  const subdivisionDx = (b - a) / subdivisionN;

  const subdivisionRectangles = useMemo(() => {
    const count = subdivisionN;
    let index = Math.floor((count - 1) / 2);
    if (focusMode === "left") index = 0;
    if (focusMode === "right") index = count - 1;

    return Array.from({ length: count }, (_, i) => ({
      key: `${count}-${i}`,
      width: `${100 / count}%`,
      selected: i === index,
    }));
  }, [subdivisionN, focusMode]);

  useEffect(() => {
    if (!running || paused) return undefined;

    const cycleMs = TRANSITION_MS + HOLD_MS;

    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;
      stageElapsedRef.current += delta;

      let idx = stageIdxRef.current;

      if (idx >= CONVERGENCE_SEQUENCE.length - 1) {
        setN(CONVERGENCE_SEQUENCE[CONVERGENCE_SEQUENCE.length - 1]);
        setProgressRatio(1);
        setGraphTransition(null);
        setRunning(false);
        setPaused(false);
        setRevealed(true);
        return;
      }

      const fromN = CONVERGENCE_SEQUENCE[idx];
      const toN = CONVERGENCE_SEQUENCE[idx + 1];
      const phaseElapsed = stageElapsedRef.current;

      if (phaseElapsed < TRANSITION_MS) {
        const transitionProgress = phaseElapsed / TRANSITION_MS;
        setN(fromN);
        setProgressRatio((idx + transitionProgress) / (CONVERGENCE_SEQUENCE.length - 1));
        setGraphTransition({
          active: true,
          fromN,
          toN,
          progress: transitionProgress,
        });
      } else {
        setN(toN);
        setProgressRatio((idx + 1) / (CONVERGENCE_SEQUENCE.length - 1));
        setGraphTransition(null);
      }

      if (stageElapsedRef.current >= cycleMs) {
        stageElapsedRef.current -= cycleMs;
        idx += 1;
        stageIdxRef.current = idx;
      }

      convergenceRafRef.current = requestAnimationFrame(tick);
    };

    convergenceRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (convergenceRafRef.current) cancelAnimationFrame(convergenceRafRef.current);
    };
  }, [paused, running, setGraphTransition, setN, setRunning]);

  useEffect(() => {
    return () => {
      if (convergenceRafRef.current) cancelAnimationFrame(convergenceRafRef.current);
      if (subdivisionRafRef.current) cancelAnimationFrame(subdivisionRafRef.current);
      setGraphTransition(null);
    };
  }, [setGraphTransition]);

  useEffect(() => {
    if (!subdivisionRunning || subdivisionPaused) return undefined;

    const tick = (ts) => {
      if (!subdivisionLastTsRef.current) subdivisionLastTsRef.current = ts;
      const delta = ts - subdivisionLastTsRef.current;
      subdivisionLastTsRef.current = ts;
      subdivisionElapsedRef.current += delta;

      if (subdivisionElapsedRef.current >= SUBDIVISION_STEP_MS) {
        subdivisionElapsedRef.current -= SUBDIVISION_STEP_MS;
        const next = subdivisionIdxRef.current + 1;
        if (next >= SUBDIVISION_SEQUENCE.length) {
          setSubdivisionRunning(false);
          setSubdivisionPaused(false);
          return;
        }
        subdivisionIdxRef.current = next;
        setSubdivisionStepIdx(next);
      }

      subdivisionRafRef.current = requestAnimationFrame(tick);
    };

    subdivisionRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (subdivisionRafRef.current) cancelAnimationFrame(subdivisionRafRef.current);
    };
  }, [subdivisionPaused, subdivisionRunning]);

  const startAnimation = () => {
    if (convergenceRafRef.current) cancelAnimationFrame(convergenceRafRef.current);
    stageIdxRef.current = 0;
    stageElapsedRef.current = 0;
    lastTsRef.current = 0;
    setProgressRatio(0);
    setPaused(false);
    setRevealed(false);
    setN(CONVERGENCE_SEQUENCE[0]);
    setGraphTransition({
      active: true,
      fromN: CONVERGENCE_SEQUENCE[0],
      toN: CONVERGENCE_SEQUENCE[1],
      progress: 0,
    });
    setRunning(true);
  };

  const pauseResume = () => {
    if (!running) return;
    setPaused((prev) => {
      const next = !prev;
      if (!next) {
        lastTsRef.current = 0;
      }
      return next;
    });
  };

  const restart = () => {
    if (convergenceRafRef.current) cancelAnimationFrame(convergenceRafRef.current);
    setRunning(false);
    setPaused(false);
    setRevealed(false);
    setPrediction(null);
    setProgressRatio(0);
    stageIdxRef.current = 0;
    stageElapsedRef.current = 0;
    lastTsRef.current = 0;
    setGraphTransition(null);
    setN(CONVERGENCE_SEQUENCE[0]);
  };

  const startSubdivision = () => {
    if (subdivisionRafRef.current) cancelAnimationFrame(subdivisionRafRef.current);
    subdivisionIdxRef.current = 0;
    subdivisionElapsedRef.current = 0;
    subdivisionLastTsRef.current = 0;
    setSubdivisionStepIdx(0);
    setSubdivisionPaused(false);
    setSubdivisionRunning(true);
  };

  const toggleSubdivisionPause = () => {
    if (!subdivisionRunning) return;
    setSubdivisionPaused((prev) => {
      const next = !prev;
      if (!next) {
        subdivisionLastTsRef.current = 0;
      }
      return next;
    });
  };

  const resetSubdivision = () => {
    if (subdivisionRafRef.current) cancelAnimationFrame(subdivisionRafRef.current);
    setSubdivisionRunning(false);
    setSubdivisionPaused(false);
    subdivisionIdxRef.current = 0;
    subdivisionElapsedRef.current = 0;
    subdivisionLastTsRef.current = 0;
    setSubdivisionStepIdx(0);
  };

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
            Rectangles split and become thinner while the Riemann sum moves toward the exact area.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={startAnimation}
            disabled={running && !paused}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {running ? "Running" : "Watch the Integral Emerge"}
          </button>
          <button
            type="button"
            onClick={pauseResume}
            disabled={!running}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={restart}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Convergence progress
            </p>
            <p className="mt-1 font-mono text-sm text-slate-800">{currentProgressText}</p>
            <p className="mt-1 text-sm text-slate-600">{stageMessage}</p>
          </div>
          <div className="min-w-[220px] rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Live comparison
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-slate-500">Approximation</dt>
              <dd className="text-right font-mono text-blue-700">{fmt(approximate)}</dd>
              <dt className="text-slate-500">Exact</dt>
              <dd className="text-right font-mono text-emerald-700">{exact === null ? "—" : fmt(exact)}</dd>
              <dt className="text-slate-500">Error</dt>
              <dd className="text-right font-mono text-slate-800">{fmt(absError)}</dd>
            </dl>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }}
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Rectangles" value={`n = ${n}`} />
          <Stat label="Strip Width" value={`Delta x = ${fmt(dx, 6)}`} />
          <Stat label="Absolute Error" value={fmt(absError)} />
          <Stat
            label="Percent Error"
            value={Number.isFinite(pctError) ? `${fmt(pctError, 4)}%` : "—"}
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-700">
          Before you watch, what do you expect for the error as rectangles increase?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["increase", "decrease", "same"].map((opt) => {
            const selected = prediction === opt;
            const showResult = revealed && selected;
            const isCorrect = opt === "decrease";
            let buttonClass = "border-slate-300 bg-white text-slate-700 hover:bg-slate-50";
            if (selected) buttonClass = "border-blue-500 bg-blue-50 text-blue-700";
            if (showResult) {
              buttonClass = isCorrect
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-red-400 bg-red-50 text-red-700";
            }

            let label = "Stay about the same";
            if (opt === "increase") label = "Increase";
            if (opt === "decrease") label = "Decrease";

            return (
              <button
                type="button"
                key={opt}
                onClick={() => setPrediction(opt)}
                disabled={running && !paused}
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1 text-sm transition disabled:opacity-60 ${buttonClass}`}
              >
                {label}
                {showResult && (isCorrect ? " - correct" : " - compare with result")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setSubdivisionOpen((prev) => !prev)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          {subdivisionOpen ? "Hide Subdivision Explorer" : "Explore Subdivision"}
        </button>

        {subdivisionOpen && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  How does one rectangle become many?
                </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Watch the partition split: 1 -&gt; 2 -&gt; 4 -&gt; 8 -&gt; 16 using the current interval [{fmt(a)}, {fmt(b)}].
                  </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startSubdivision}
                  disabled={subdivisionRunning && !subdivisionPaused}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={toggleSubdivisionPause}
                  disabled={!subdivisionRunning}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {subdivisionPaused ? "Resume" : "Pause"}
                </button>
                <button
                  type="button"
                  onClick={resetSubdivision}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["left", "Left strip"],
                ["middle", "Middle strip"],
                ["right", "Right strip"],
              ].map(([id, label]) => {
                const active = focusMode === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setFocusMode(id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-mono text-slate-800">n = {subdivisionN}</span>
                <span className="font-mono text-slate-700">Delta x = (b - a) / n = {fmt(subdivisionDx, 6)}</span>
              </div>
              <div className="mt-3 flex h-14 w-full overflow-hidden rounded-md border border-slate-300 bg-white">
                {subdivisionRectangles.map((rect) => (
                  <div
                    key={rect.key}
                    className={`h-full border-r border-slate-200 transition-all duration-700 last:border-r-0 ${
                      rect.selected
                        ? "bg-blue-300/80"
                        : "bg-blue-100/70"
                    }`}
                    style={{ width: rect.width }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-600">
                The highlighted representative strip narrows as the interval is subdivided.
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={`mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-opacity duration-500 ${
          revealed ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <p className="text-sm text-slate-700">As the rectangles become narrower...</p>
        <p className="mt-1 font-mono text-lg text-slate-900">Delta x -&gt; 0</p>
        <p className="mt-3 text-sm text-slate-700">...the Riemann-sum approximation approaches...</p>
        <p className="mt-1 font-mono text-lg text-slate-900">sum f(x_i*) Delta x</p>
        <p className="mt-3 text-sm text-slate-700">...the definite integral.</p>
        <p className="mt-1 font-mono text-lg text-slate-900">Integral_a^b f(x) dx</p>

        <div className="mt-3 grid gap-2 rounded-lg border border-emerald-300 bg-white p-3 sm:grid-cols-3">
          <Stat label="Approximation" value={fmt(approximate)} tone="blue" />
          <Stat label="Exact area" value={exact === null ? "—" : fmt(exact)} tone="emerald" />
          <Stat label="Final error" value={fmt(absError)} />
        </div>

        <p className="mt-3 text-sm font-medium text-slate-900">
          Approximation is converging to the exact area.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, tone = "slate" }) {
  let colorClass = "text-slate-900";
  if (tone === "blue") colorClass = "text-blue-700";
  if (tone === "emerald") colorClass = "text-emerald-700";

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 font-mono text-sm ${colorClass}`}>{value}</p>
    </div>
  );
}
