export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Class 11 / 12 · Mathematics
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Riemann Sums → The Integral
        </h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-base">
          See how a stack of rectangles becomes the exact area under a curve.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Move the <span className="font-medium text-slate-700">Rectangles</span> slider
          and watch the blue area get closer to the green outline — that's the
          whole idea.
        </p>
      </div>
    </header>
  );
}
