export function differenceInPercentage(currentValue: number, oldValue: number) {
  return ((oldValue - currentValue) / currentValue) * 100;
}
