export const calculateVariation = (
  current: number,
  previous: number,
): {
  variation: string;
  signal: "+" | "-";
} => {
  const variationValue = ((current - previous) / previous) * 100;

  if (isNaN(variationValue) || !isFinite(variationValue)) {
    return {
      variation: "0%",
      signal: "+",
    };
  }
  return {
    variation: `${parseFloat(variationValue.toFixed(2))}%`.replace("-", ""),
    signal: current > previous ? "+" : "-",
  };
};

/**
 * Calculates the percentage of a value relative to a total.
 *
 * @param value - The value to calculate the percentage for.
 * @param total - The total amount.
 * @returns The percentage as a string followed by a '%' sign. Returns "0%" if the percentage is NaN or infinite.
 */
export const calculatePercentage = (value: number, total: number): string => {
  const percentage = (value / total) * 100;
  if (isNaN(percentage) || !isFinite(percentage)) {
    return "0%";
  }
  return `${percentage}%`;
};
