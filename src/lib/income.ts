export interface IncomeBracket {
  id: string;
  min: number;
  max: number | null;
}

const BRACKETS: IncomeBracket[] = [
  { id: "under-200k", min: 0, max: 200_000 },
  { id: "200k-400k", min: 200_000, max: 400_000 },
  { id: "400k-800k", min: 400_000, max: 800_000 },
  { id: "above-800k", min: 800_000, max: null },
];

function formatCompact(value: number, currency: string) {
  const compact = value >= 1000 ? `${value / 1000}K` : `${value}`;
  return `${currency} ${compact}`;
}

export function getIncomeBrackets(currency: string) {
  return BRACKETS.map((bracket) => ({
    id: bracket.id,
    label:
      bracket.min === 0
        ? `Under ${formatCompact(bracket.max as number, currency)}`
        : bracket.max === null
          ? `Above ${formatCompact(bracket.min, currency)}`
          : `${formatCompact(bracket.min, currency)} – ${formatCompact(bracket.max, currency)}`,
  }));
}
