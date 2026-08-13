import type { CurrencyCode } from "@/lib/countries";

export interface IncomeBracket {
  id: string;
  /** Lower edge of the band, in INR. */
  min: number;
  /** Upper edge of the band, in INR. `null` for the open-ended top band. */
  max: number | null;
}

/**
 * Bands follow the Indian income standard (lakh / crore). Every other currency
 * is a converted, rounded view of these same five bands, so a bracket id means
 * the same thing no matter which country the user picked.
 */
const BRACKETS: IncomeBracket[] = [
  { id: "inr-0-12l", min: 0, max: 1_200_000 },
  { id: "inr-12l-24l", min: 1_200_000, max: 2_400_000 },
  { id: "inr-24l-50l", min: 2_400_000, max: 5_000_000 },
  { id: "inr-50l-1cr", min: 5_000_000, max: 10_000_000 },
  { id: "inr-1cr-plus", min: 10_000_000, max: null },
];

/**
 * Indicative INR per 1 unit of currency. These only position band edges, which
 * are then rounded hard, so they do not need to track the live market — a few
 * percent of drift never moves a rounded edge.
 */
const INR_PER_UNIT: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 87,
  EUR: 95,
  GBP: 111,
  AED: 23.7,
  SAR: 23.2,
  QAR: 23.9,
  KWD: 284,
  OMR: 226,
  BHD: 231,
  CAD: 62,
  AUD: 57,
  NZD: 51,
  SGD: 65,
  MYR: 20.5,
  HKD: 11.2,
  JPY: 0.57,
  ZAR: 4.8,
};

/**
 * Rounds a converted edge to a "presentable" number: two significant digits
 * (three when the leading digit is 1, so 115K does not collapse to 110K), and
 * never finer than the nearest thousand — so every edge ends in three zeros.
 */
function roundEdge(value: number) {
  const exponent = Math.floor(Math.log10(value));
  const mantissa = value / 10 ** exponent;
  const step = Math.max(1000, 10 ** (exponent - (mantissa >= 2 ? 1 : 2)));
  return Math.round(value / step) * step;
}

function formatAmount(value: number, currency: CurrencyCode) {
  if (currency === "INR") {
    return value >= 10_000_000
      ? `${trimZeros(value / 10_000_000)}Cr`
      : `${trimZeros(value / 100_000)}L`;
  }
  return value >= 1_000_000
    ? `${trimZeros(value / 1_000_000)}M`
    : `${trimZeros(value / 1000)}K`;
}

function trimZeros(value: number) {
  return Number(value.toFixed(2)).toString();
}

/**
 * Converts every band edge into `currency` and rounds it. Rounding is applied
 * per edge and then forced upwards where two edges would otherwise collide, so
 * the bands stay strictly increasing and gap-free.
 */
function getEdges(currency: CurrencyCode) {
  const rate = INR_PER_UNIT[currency] ?? 1;
  const edges: number[] = [];
  for (const bracket of BRACKETS) {
    if (bracket.max === null) continue;
    const rounded = roundEdge(bracket.max / rate);
    const previous = edges[edges.length - 1] ?? 0;
    edges.push(rounded > previous ? rounded : previous + 1000);
  }
  return edges;
}

export function getIncomeBrackets(currency: CurrencyCode) {
  const edges = getEdges(currency);
  return BRACKETS.map((bracket, index) => {
    const lower = edges[index - 1];
    const upper = edges[index];
    return {
      id: bracket.id,
      label:
        index === 0
          ? `Under ${currency} ${formatAmount(upper, currency)}`
          : upper === undefined
            ? `Above ${currency} ${formatAmount(lower, currency)}`
            : `${currency} ${formatAmount(lower, currency)} – ${formatAmount(upper, currency)}`,
    };
  });
}
