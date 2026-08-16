import { useElementSize } from "@/hooks/useElementSize";
import { riemannSum, N_SEQUENCE } from "@/utils/riemann";
import { exactIntegral, fmt } from "@/utils/integration";

export default function ErrorChart({
  fn,
  a,
  b,
  method,
  currentN,
}) {
  const [ref, size] = useElementSize();
  const exact = exactIntegral(fn, a, b);

  const points = N_SEQUENCE.map((n) => {
    const approx = riemannSum(fn, a, b, n, method).sum;
    const err = exact === null ? NaN : Math.abs(approx - exact);
    return { n, err };
  });

  const hasData = exact !== null && points.every((p) => Number.isFinite(p.err));

  return (
    <section
      aria-label="Error chart"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        How the error shrinks
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Each dot is the real gap between the rectangle total and the true area
        for that many rectangles. The line drops as we add more — that's
        convergence.
      </p>

      <div ref={ref} className="mt-3 h-[clamp(180px,26vh,280px)] w-full">
        {hasData ? (
          <svg
            width={size.width}
            height={size.height}
            role="img"
            aria-label="Error versus number of rectangles chart"
            className="overflow-visible"
          >
            <ErrorSvg
              width={size.width}
              height={size.height}
              points={points}
              currentN={currentN}
            />
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Exact area unknown — this chart needs a function with a known true area.
          </div>
        )}
      </div>
    </section>
  );
}

const PAD = { top: 14, right: 16, bottom: 30, left: 56 };

function ErrorSvg({ width, height, points, currentN }) {
  if (width === 0 || height === 0) return null;
  const pw = width - PAD.left - PAD.right;
  const ph = height - PAD.top - PAD.bottom;

  const maxErr = Math.max(...points.map((p) => p.err));
  const minN = points[0].n;
  const maxN = points[points.length - 1].n;
  const logMin = Math.log2(minN);
  const logMax = Math.log2(maxN);

  const sx = (n) =>
    PAD.left + ((Math.log2(n) - logMin) / (logMax - logMin)) * pw;
  const sy = (err) =>
    PAD.top + ph - (err / (maxErr || 1)) * ph;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.n).toFixed(1)} ${sy(p.err).toFixed(1)}`)
    .join(" ");

  const yTicks = [0, maxErr / 2, maxErr];

  return (
    <g>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={PAD.left + pw}
            y1={sy(t)}
            y2={sy(t)}
            stroke="rgb(241 245 249)"
          />
          <text
            x={PAD.left - 6}
            y={sy(t)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="10"
            fill="rgb(100 116 139)"
            fontFamily="ui-monospace, monospace"
          >
            {fmt(t, 3)}
          </text>
        </g>
      ))}

      {points.map((p) => (
        <g key={p.n}>
          <line
            x1={sx(p.n)}
            x2={sx(p.n)}
            y1={PAD.top + ph}
            y2={PAD.top + ph + 4}
            stroke="rgb(148 163 184)"
          />
          <text
            x={sx(p.n)}
            y={PAD.top + ph + 16}
            textAnchor="middle"
            fontSize="10"
            fill="rgb(100 116 139)"
            fontFamily="ui-monospace, monospace"
          >
            {p.n}
          </text>
        </g>
      ))}

      <line
        x1={PAD.left}
        x2={PAD.left + pw}
        y1={PAD.top + ph}
        y2={PAD.top + ph}
        stroke="rgb(148 163 184)"
      />
      <line
        x1={PAD.left}
        x2={PAD.left}
        y1={PAD.top}
        y2={PAD.top + ph}
        stroke="rgb(148 163 184)"
      />

      <path
        d={`${path} L ${sx(maxN)} ${sy(0)} L ${sx(minN)} ${sy(0)} Z`}
        fill="rgba(239,68,68,0.08)"
      />

      <path
        d={path}
        fill="none"
        stroke="rgb(220 38 38)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {points.map((p) => {
        const nearCurrent = Math.abs(p.n - currentN) <= 0;
        return (
          <g key={`pt-${p.n}`}>
            <circle
              cx={sx(p.n)}
              cy={sy(p.err)}
              r={nearCurrent ? 4.5 : 3}
              fill={nearCurrent ? "rgb(37 99 235)" : "rgb(220 38 38)"}
              stroke="white"
              strokeWidth="1"
            />
            {nearCurrent && (
              <text
                x={sx(p.n)}
                y={sy(p.err) - 9}
                textAnchor="middle"
                fontSize="10"
                fill="rgb(37 99 235)"
                fontFamily="ui-monospace, monospace"
              >
                {fmt(p.err, 4)}
              </text>
            )}
          </g>
        );
      })}

      <text
        x={PAD.left + pw / 2}
        y={height - 4}
        textAnchor="middle"
        fontSize="10"
        fill="rgb(100 116 139)"
        fontFamily="ui-monospace, monospace"
      >
        Rectangles
      </text>
      <text
        x={16}
        y={PAD.top + ph / 2}
        textAnchor="middle"
        transform={`rotate(-90 16 ${PAD.top + ph / 2})`}
        fontSize="10"
        fill="rgb(100 116 139)"
        fontFamily="ui-monospace, monospace"
      >
        Error
      </text>
    </g>
  );
}
