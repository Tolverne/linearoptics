export type NumericDisplayMode = "decimal" | "exact" | "both";

type FormatOptions = {
  tolerance?: number;
  decimalPlaces?: number;
  maxDenominator?: number;
  mode?: NumericDisplayMode;
  latex?: boolean;
};

type ExactCandidate = {
  value: number;
  text: string;
  latex: string;
  priority: number;
};

const DEFAULT_TOLERANCE = 1e-5;
const DEFAULT_DECIMAL_PLACES = 4;
const DEFAULT_MAX_DENOMINATOR = 32;

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));

  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }

  return x || 1;
}

function trimDecimal(value: number, decimalPlaces: number): string {
  const clean = Math.abs(value) < 10 ** (-(decimalPlaces + 2)) ? 0 : value;
  return Number(clean.toFixed(decimalPlaces)).toString();
}

function applySign(text: string, sign: number): string {
  if (sign >= 0 || text === "0") return text;
  return `-${text}`;
}

function applyLatexSign(text: string, sign: number): string {
  if (sign >= 0 || text === "0") return text;
  return `-${text}`;
}

function fractionText(numerator: number, denominator: number): string {
  if (denominator === 1) return `${numerator}`;
  return `${numerator}/${denominator}`;
}

function fractionLatex(numerator: number, denominator: number): string {
  if (denominator === 1) return `${numerator}`;
  return `\\frac{${numerator}}{${denominator}}`;
}

function piMultipleText(numerator: number, denominator: number): string {
  if (numerator === 0) return "0";

  const absNumerator = Math.abs(numerator);
  const sign = numerator < 0 ? "-" : "";
  const coefficient = absNumerator === 1 ? "" : `${absNumerator}`;
  const piTerm = `${coefficient}π`;

  if (denominator === 1) return `${sign}${piTerm}`;
  return `${sign}${piTerm}/${denominator}`;
}

function piMultipleLatex(numerator: number, denominator: number): string {
  if (numerator === 0) return "0";

  const absNumerator = Math.abs(numerator);
  const sign = numerator < 0 ? "-" : "";
  const coefficient = absNumerator === 1 ? "" : `${absNumerator}`;
  const piTerm = `${coefficient}\\pi`;

  if (denominator === 1) return `${sign}${piTerm}`;
  return `${sign}\\frac{${piTerm}}{${denominator}}`;
}

function buildPiCandidates(maxDenominator: number): ExactCandidate[] {
  const candidates: ExactCandidate[] = [];

  for (let denominator = 1; denominator <= maxDenominator; denominator += 1) {
    for (let numerator = 0; numerator <= maxDenominator; numerator += 1) {
      const divisor = gcd(numerator, denominator);
      const reducedNumerator = numerator / divisor;
      const reducedDenominator = denominator / divisor;

      if (reducedNumerator !== numerator || reducedDenominator !== denominator) {
        continue;
      }

      candidates.push({
        value: (numerator * Math.PI) / denominator,
        text: piMultipleText(numerator, denominator),
        latex: piMultipleLatex(numerator, denominator),
        priority: denominator + numerator / 100,
      });
    }
  }

  return candidates;
}

function buildRationalCandidates(maxDenominator: number): ExactCandidate[] {
  const candidates: ExactCandidate[] = [];

  for (let denominator = 1; denominator <= maxDenominator; denominator += 1) {
    for (let numerator = 0; numerator <= maxDenominator; numerator += 1) {
      const divisor = gcd(numerator, denominator);
      const reducedNumerator = numerator / divisor;
      const reducedDenominator = denominator / divisor;

      if (reducedNumerator !== numerator || reducedDenominator !== denominator) {
        continue;
      }

      candidates.push({
        value: numerator / denominator,
        text: fractionText(numerator, denominator),
        latex: fractionLatex(numerator, denominator),
        priority: 100 + denominator + numerator / 100,
      });
    }
  }

  return candidates;
}

function buildRootCandidates(): ExactCandidate[] {
  return [
    {
      value: 1 / Math.sqrt(2),
      text: "1/√2",
      latex: "\\frac{1}{\\sqrt{2}}",
      priority: 20,
    },
    {
      value: Math.sqrt(2) / 2,
      text: "√2/2",
      latex: "\\frac{\\sqrt{2}}{2}",
      priority: 21,
    },
    {
      value: 1 / Math.sqrt(3),
      text: "1/√3",
      latex: "\\frac{1}{\\sqrt{3}}",
      priority: 22,
    },
    {
      value: Math.sqrt(3) / 2,
      text: "√3/2",
      latex: "\\frac{\\sqrt{3}}{2}",
      priority: 23,
    },
    {
      value: Math.sqrt(2),
      text: "√2",
      latex: "\\sqrt{2}",
      priority: 24,
    },
    {
      value: Math.sqrt(3),
      text: "√3",
      latex: "\\sqrt{3}",
      priority: 25,
    },
  ];
}

function findExactCandidate(
  value: number,
  tolerance: number,
  maxDenominator: number
): ExactCandidate | null {
  if (!Number.isFinite(value)) return null;

  const sign = value < 0 ? -1 : 1;
  const magnitude = Math.abs(value);

  const candidates = [
    ...buildPiCandidates(maxDenominator),
    ...buildRootCandidates(),
    ...buildRationalCandidates(maxDenominator),
  ];

  const match = candidates
    .map((candidate) => ({
      ...candidate,
      error: Math.abs(magnitude - candidate.value),
    }))
    .filter((candidate) => candidate.error <= tolerance)
    .sort((a, b) => a.error - b.error || a.priority - b.priority)[0];

  if (!match) return null;

  return {
    value: sign * match.value,
    text: applySign(match.text, sign),
    latex: applyLatexSign(match.latex, sign),
    priority: match.priority,
  };
}

export function formatDecimalNumber(
  value: number,
  decimalPlaces = DEFAULT_DECIMAL_PLACES
): string {
  if (!Number.isFinite(value)) return String(value);
  return trimDecimal(value, decimalPlaces);
}

export function formatNiceNumber(
  value: number,
  options: FormatOptions = {}
): string {
  const {
    tolerance = DEFAULT_TOLERANCE,
    decimalPlaces = DEFAULT_DECIMAL_PLACES,
    maxDenominator = DEFAULT_MAX_DENOMINATOR,
    mode = "exact",
    latex = false,
  } = options;

  const decimal = formatDecimalNumber(value, decimalPlaces);
  const exact = findExactCandidate(value, tolerance, maxDenominator);
  const exactText = exact ? (latex ? exact.latex : exact.text) : decimal;

  if (mode === "decimal") return decimal;
  if (mode === "both" && exact && exactText !== decimal) {
    return latex ? `${decimal}\\;(=${exactText})` : `${decimal} (= ${exactText})`;
  }

  return exactText;
}
