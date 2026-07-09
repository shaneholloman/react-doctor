// rule: only-export-components
// weakness: name-heuristic
// source: fuzz session 2026-07-08 (adversarial edge-case audit: PascalCase
//         function names in an exported object treated as bundled components
//         without render-output evidence)
const FormatDate = (date: Date) => date.toISOString().slice(0, 10);
const FormatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const formatters = {
  FormatDate,
  FormatCurrency,
  ShortTime: (date: Date) => date.toLocaleTimeString(),
  locale: "en-US",
};
