export function parseMonetaryToNumber(value: string) {
  if (!value) return 0;
  const monetary = parseFloat(value.replace(/\./g, "").replace(",", "."));
  return monetary;
}
