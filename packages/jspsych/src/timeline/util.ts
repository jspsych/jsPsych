/**
 * Maintains a promise and offers a function to resolve it. Whenever the promise is resolved, it is
 * replaced with a new one.
 */
export class PromiseWrapper<ResolveType = void> {
  constructor() {
    this.reset();
  }

  private promise: Promise<ResolveType>;
  private resolvePromise: (resolveValue: ResolveType) => void;

  reset() {
    this.promise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }
  get() {
    return this.promise;
  }
  resolve(value: ResolveType) {
    this.resolvePromise(value);
    this.reset();
  }
}

export function isPromise(value: any): value is Promise<any> {
  return value && typeof value["then"] === "function";
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns the string representation of a `path` array like accepted by lodash's `get` and `set`
 * functions.
 */
export function parameterPathArrayToString([firstPathElement, ...remainingPathElements]: string[]) {
  let pathString = firstPathElement;

  for (const pathElement of remainingPathElements) {
    pathString += Number.isNaN(Number.parseInt(pathElement))
      ? `.${pathElement}`
      : `[${pathElement}]`;
  }

  return pathString;
}
