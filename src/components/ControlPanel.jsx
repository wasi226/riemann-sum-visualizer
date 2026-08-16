import { useState } from "react";
import { BUILTIN_LIST } from "@/utils/functions";
import { METHOD_LABELS } from "@/utils/riemann";

const N_MIN = 1;
const N_MAX = 256;

const METHODS = ["left", "midpoint", "right"];
const METHOD_HINTS = {
  left: "Use the left edge of each strip",
  midpoint: "Use the middle of each strip",
  right: "Use the right edge of each strip",
};

const CUSTOM_ID = "custom";

export default function ControlPanel({
  fn,
  setBuiltinFn,
  setCustomFn,
  customExpr,
  customError,
  a,
  b,
  setInterval,
  n,
  setN,
  method,
  setMethod,
  exact,
  disabled = false,
}) {
  const invalidInterval = !(a < b);
  const isCustom = fn.id === CUSTOM_ID;
  const [draft, setDraft] = useState("");

  return (
    <section
      aria-label="Simulation controls"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Controls
      </h2>

      <div className="mt-4">
        <label htmlFor="fn-select" className="block text-sm font-medium text-slate-700">
          Function
        </label>
        <p className="mb-1.5 text-xs text-slate-500">
          Pick one from the list, or choose "Custom" to type your own.
        </p>
        <select
          id="fn-select"
          value={isCustom ? CUSTOM_ID : fn.id}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value === CUSTOM_ID) {
              setBuiltinFn(CUSTOM_ID);
            } else {
              setBuiltinFn(e.target.value);
            }
          }}
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
        >
          {BUILTIN_LIST.map((fnOpt) => (
            <option key={fnOpt.id} value={fnOpt.id}>
              {fnOpt.formula}
            </option>
          ))}
          <option value={CUSTOM_ID}>Custom — type your own</option>
        </select>
      </div>

      {isCustom && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
          <label htmlFor="custom-fn" className="block text-sm font-medium text-slate-700">
            Your function
          </label>
          <p className="mb-1.5 text-xs text-slate-500">
            Use <span className="font-mono">x</span> as the variable. You can use
            <span className="font-mono"> + − * / </span>,
            <span className="font-mono"> ^ </span> for powers, and
            <span className="font-mono"> sin, cos, sqrt, abs, exp, log, pi, e</span>.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                f(x)=
              </span>
              <input
                id="custom-fn"
                type="text"
                value={draft}
                disabled={disabled}
                placeholder="x^2 + sin(x)"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft.trim()) {
                    setCustomFn(draft);
                  }
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-11 pr-2 text-sm font-mono text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
            </div>
            <button
              onClick={() => setCustomFn(draft)}
              disabled={disabled || !draft.trim()}
              className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {customError && (
            <p className="mt-1.5 text-xs text-red-600" role="alert">
              {customError}
            </p>
          )}
          {customExpr && !customError && (
            <p className="mt-1.5 text-xs text-emerald-700">
              Using <span className="font-mono">f(x) = {customExpr}</span>
            </p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            Note: for custom functions we don't know the exact area, so the green
            outline and the error chart stay hidden — but the rectangles still
            work.
          </p>
        </div>
      )}

      <div className="mt-4">
        <span className="block text-sm font-medium text-slate-700">
          Where to measure the height
        </span>
        <p className="mb-1.5 text-xs text-slate-500">
          Each rectangle's height comes from the curve at one spot in its strip.
        </p>
        <div
          role="radiogroup"
          aria-label="Riemann sum method"
          className="inline-flex w-full rounded-lg border border-slate-300 bg-slate-50 p-1"
        >
          {METHODS.map((m) => {
            const active = m === method;
            return (
              <button
                key={m}
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setMethod(m)}
                className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                  active
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {METHOD_LABELS[m]}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">{METHOD_HINTS[method]}</p>
      </div>

      <div className="mt-4">
        <span className="block text-sm font-medium text-slate-700">
          Interval <span className="text-slate-400">[a, b]</span>
        </span>
        <p className="mb-1.5 text-xs text-slate-500">
          The left and right edges of the region we're measuring.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="a"
            value={a}
            disabled={disabled}
            step={0.5}
            onChange={(v) => setInterval(v, b)}
          />
          <NumberField
            label="b"
            value={b}
            disabled={disabled}
            step={0.5}
            onChange={(v) => setInterval(a, v)}
          />
        </div>
        {invalidInterval && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            a must be less than b.
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="n-slider" className="text-sm font-medium text-slate-700">
            Rectangles
          </label>
          <span className="font-mono text-sm text-slate-900">n = {n}</span>
        </div>
        <p className="mb-2 text-xs text-slate-500">
          More rectangles = thinner strips = closer to the true area. Try
          dragging from 1 to 256.
        </p>
        <input
          id="n-slider"
          type="range"
          min={N_MIN}
          max={N_MAX}
          step={1}
          value={n}
          disabled={disabled}
          aria-valuemin={N_MIN}
          aria-valuemax={N_MAX}
          aria-valuenow={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 disabled:opacity-50"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>1</span>
          <span>64</span>
          <span>256</span>
        </div>
      </div>

      {exact !== null && (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          The green dashed outline shows the true area — the rectangles are
          trying to match it.
        </p>
      )}
    </section>
  );
}

function NumberField({ label, value, step = 1, disabled, onChange }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
          {label}=
        </span>
        <input
          type="number"
          value={value}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange(v);
          }}
          className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
        />
      </div>
    </label>
  );
}
