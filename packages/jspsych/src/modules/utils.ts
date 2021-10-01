/**
 * Finds all of the unique items in an array.
 * @param arr The array to extract unique values from
 * @returns An array with one copy of each unique item in `arr`
 */
export function unique(arr: Array<any>) {
  return [...new Set(arr)];
}

export function deepCopy(obj) {
  if (!obj) return obj;
  let out;
  if (Array.isArray(obj)) {
    out = [];
    for (const x of obj) {
      out.push(deepCopy(x));
    }
    return out;
  } else if (typeof obj === "object" && obj !== null) {
    out = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        out[key] = deepCopy(obj[key]);
      }
    }
    return out;
  } else {
    return obj;
  }
}
