import { useMemo, useState } from "react";
import Header from "@/components/Header";
import ControlPanel from "@/components/ControlPanel";
import MathPanel from "@/components/MathPanel";
import SimulationGraph from "@/components/SimulationGraph";
import AhaMoment from "@/components/AhaMoment";
import MethodComparison from "@/components/MethodComparison";
import ErrorChart from "@/components/ErrorChart";
import Explanation from "@/components/Explanation";
import { BUILTIN_FUNCTIONS } from "@/utils/functions";
import { riemannSum, absoluteError, percentError } from "@/utils/riemann";
import { exactIntegral } from "@/utils/integration";
import { parseFunction, makeCustomFnDef } from "@/utils/parseFunction";

const EMPTY_CUSTOM = {
  id: "custom",
  label: "",
  formula: "f(x) = ?",
  f: () => NaN,
  exact: null,
  antiderivative: "not known (custom)",
  hint: "Type a function below",
};

export default function App() {
  const [method, setMethod] = useState("midpoint");
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const [n, setN] = useState(8);
  const [running, setRunning] = useState(false);
  const [graphTransition, setGraphTransition] = useState(null);

  const [builtinId, setBuiltinId] = useState("square");
  const [customFn, setCustomFn] = useState(null);
  const [customExpr, setCustomExpr] = useState("");
  const [customError, setCustomError] = useState(null);

  const isCustomMode = builtinId === "custom";
  const fn = isCustomMode ? (customFn ?? EMPTY_CUSTOM) : BUILTIN_FUNCTIONS[builtinId];

  const handleSetBuiltinFn = (id) => {
    setBuiltinId(id);
    if (id !== "custom") {
      setCustomFn(null);
      setCustomExpr("");
      setCustomError(null);
    }
  };

  const handleSetCustomFn = (expr) => {
    const { fn: parsed, error } = parseFunction(expr);
    if (parsed) {
      setCustomFn(makeCustomFnDef(expr, parsed));
      setCustomExpr(expr.trim());
      setCustomError(null);
    } else {
      setCustomError(error);
    }
  };

  const setIntervalAB = (na, nb) => {
    setA(na);
    setB(nb);
  };

  const exact = useMemo(() => exactIntegral(fn, a, b), [fn, a, b]);
  const valid = a < b && n >= 1;

  const { sum, rectangles, dx } = useMemo(
    () => (valid ? riemannSum(fn, a, b, n, method) : { sum: 0, rectangles: [], dx: 0 }),
    [fn, a, b, n, method, valid],
  );

  const absErr = absoluteError(sum, exact);
  const pctErr = percentError(sum, exact);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
          <section
            aria-label="Riemann sum graph"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <SimulationGraph
              fn={fn}
              a={a}
              b={b}
              dx={dx}
              rectangles={rectangles}
              method={method}
              approximate={sum}
              exact={exact}
              rectOpacity={1}
              transition={graphTransition}
            />
          </section>

          <div className="flex flex-col gap-6">
            <ControlPanel
              fn={fn}
              setBuiltinFn={handleSetBuiltinFn}
              setCustomFn={handleSetCustomFn}
              customExpr={customExpr}
              customError={customError}
              a={a}
              b={b}
              setInterval={setIntervalAB}
              n={n}
              setN={setN}
              method={method}
              setMethod={setMethod}
              exact={exact}
              disabled={running}
            />
            <MathPanel
              fn={fn}
              a={a}
              b={b}
              n={n}
              dx={dx}
              method={method}
              approximate={sum}
              exact={exact}
              absError={absErr}
              pctError={pctErr}
            />
          </div>
        </div>

        <div className="mt-6">
          <AhaMoment
            fn={fn}
            a={a}
            b={b}
            method={method}
            n={n}
            dx={dx}
            approximate={sum}
            exact={exact}
            absError={absErr}
            pctError={pctErr}
            setN={setN}
            running={running}
            setRunning={setRunning}
            setGraphTransition={setGraphTransition}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <MethodComparison fn={fn} a={a} b={b} n={n} current={method} />
          <ErrorChart fn={fn} a={a} b={b} method={method} currentN={n} />
        </div>

        <div className="mt-6">
          <Explanation />
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-500">
          <p>
            Built for a Class 11/12 mathematics interactive. All areas, errors
            and exact integrals are computed live in your browser.
          </p>
        </footer>
      </main>
    </div>
  );
}
