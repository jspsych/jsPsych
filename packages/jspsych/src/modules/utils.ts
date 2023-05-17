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

/**
 * Merges two objects, recursively.
 * @param obj1 Object to merge
 * @param obj2 Object to merge
 */
export function deepMerge(obj1: any, obj2: any): any {
  let merged = {};
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (typeof obj1[key] === "object" && obj2.hasOwnProperty(key)) {
        merged[key] = deepMerge(obj1[key], obj2[key]);
      } else {
        merged[key] = obj1[key];
      }
    }
  }
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!merged.hasOwnProperty(key)) {
        merged[key] = obj2[key];
      } else if (typeof obj2[key] === "object") {
        merged[key] = deepMerge(merged[key], obj2[key]);
      } else {
        merged[key] = obj2[key];
      }
    }
  }

  return merged;
}
