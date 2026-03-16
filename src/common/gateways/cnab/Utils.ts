/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Utils {
  // expects item.value and item.length
  padString(item: { value?: any; length: number }): string {
    const value: string =
      (item.value != null ? item.value.toString().trim() : undefined) || "";
    return (
      value.toString().trim() +
      new Array(item.length).fill(" ").join("").substring(value.length)
    );
  }

  // expects item.value and item.length
  padNumber(item: { value?: any; length: number }): string {
    const value: string =
      (item.value != null ? item.value.toString().trim() : undefined) || "";
    return (
      new Array(item.length).fill("0").join("").substring(value.length) + value
    );
  }
}

export default Utils;
