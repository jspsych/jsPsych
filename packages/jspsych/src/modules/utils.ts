// methods used in multiple modules //

export function flatten(arr, out?) {
  out = typeof out === "undefined" ? [] : out;
  for (var i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      flatten(arr[i], out);
    } else {
      out.push(arr[i]);
    }
  }
  return out;
}

export function unique(arr) {
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) == i) {
      out.push(arr[i]);
    }
  }
  return out;
}

export function deepCopy(obj) {
  if (!obj) return obj;
  var out;
  if (Array.isArray(obj)) {
    out = [];
    for (var i = 0; i < obj.length; i++) {
      out.push(deepCopy(obj[i]));
    }
    return out;
  } else if (typeof obj === "object") {
    out = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        out[key] = deepCopy(obj[key]);
      }
    }
    return out;
  } else {
    return obj;
  }
}
