export const BUILTIN_FUNCTIONS = {
  square: {
    id: "square",
    label: "x²",
    formula: "f(x) = x²",
    f: (x) => x * x,
    exact: (a, b) => (b ** 3 - a ** 3) / 3,
    antiderivative: "F(x) = x³ / 3",
    hint: "Parabola",
  },
  linear: {
    id: "linear",
    label: "x",
    formula: "f(x) = x",
    f: (x) => x,
    exact: (a, b) => (b * b - a * a) / 2,
    antiderivative: "F(x) = x² / 2",
    hint: "Line through origin",
  },
  sin: {
    id: "sin",
    label: "sin(x)",
    formula: "f(x) = sin(x)",
    f: (x) => Math.sin(x),
    exact: (a, b) => Math.cos(a) - Math.cos(b),
    antiderivative: "F(x) = -cos(x)",
    hint: "Sine wave (radians)",
  },
  cube: {
    id: "cube",
    label: "x³",
    formula: "f(x) = x³",
    f: (x) => x * x * x,
    exact: (a, b) => (b ** 4 - a ** 4) / 4,
    antiderivative: "F(x) = x⁴ / 4",
    hint: "Cubic",
  },
};

export const BUILTIN_LIST = [
  BUILTIN_FUNCTIONS.square,
  BUILTIN_FUNCTIONS.linear,
  BUILTIN_FUNCTIONS.sin,
  BUILTIN_FUNCTIONS.cube,
];
